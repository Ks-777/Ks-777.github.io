document.addEventListener("DOMContentLoaded", function() {
    const navLinks = document.querySelectorAll(".nav-link");
    const header = document.querySelector('.site-header');
    const menuToggle = document.getElementById("menu-toggle");

    // ナビゲーションリンクのクリック処理修正
    navLinks.forEach(link => {
        // data-target 属性がある場合は内部リンクとしてスムーズスクロールする
        const targetSectionId = link.getAttribute("data-target");
        if(targetSectionId) {
            link.addEventListener("click", function(e) {
                e.preventDefault();
                const targetSection = document.getElementById(targetSectionId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
                if(header.classList.contains("nav-open")){
                    header.classList.remove("nav-open");
                }
            });
        }
        // data-target が無い場合は通常のリンク遷移を行う
    });

    // スクロールアニメーション
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // 一度表示されたら監視を解除
            }
        });
    }, observerOptions);

    // アニメーション対象の要素を監視
    document.querySelectorAll('.scroll-reveal').forEach(element => {
        observer.observe(element);
    });

    // ヘッダーのスクロール制御
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        
        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
            return;
        }
        
        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }
        lastScroll = currentScroll;
    });

    // ハンバーガーメニューの表示／非表示切替処理
    if(menuToggle) {
        menuToggle.addEventListener("click", function() {
            header.classList.toggle("nav-open");
        });
    }

    // PCなど画面幅が広い場合、ホバーでメニューを展開／非表示にする
    if(window.innerWidth > 768 && menuToggle) {
        menuToggle.addEventListener("mouseenter", function() {
            header.classList.add("nav-open");
        });
        header.addEventListener("mouseleave", function() {
            header.classList.remove("nav-open");
        });
    }

    // メニュー外クリックで閉じる
    document.addEventListener('click', function(e) {
        if (!header.contains(e.target) && !menuToggle.contains(e.target) && header.classList.contains('nav-open')) {
            header.classList.remove('nav-open');
        }
    });

    // 追加: モバイル向けタッチイベントでメニュー外をタッチしたら閉じる
    document.addEventListener('touchstart', function(e) {
        if (!header.contains(e.target) && header.classList.contains('nav-open')) {
            header.classList.remove('nav-open');
        }
    });

    // ESCキーでメニューを閉じる
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && header.classList.contains('nav-open')) {
            header.classList.remove('nav-open');
        }
    });

    // タッチデバイスでのホバー対応
    if ('ontouchstart' in window) {
        const nav = document.querySelector('nav');
        nav.addEventListener('touchstart', function(e) {
            e.preventDefault();
            if (window.innerWidth > 768) {
                this.classList.toggle('hover');
            }
        });
    }

    // Cookieバナー
    const cookieBanner = document.getElementById("cookie-banner");
    if (localStorage.getItem("cookieAccepted") === "true") {
        cookieBanner.style.display = "none";
    }
    document.getElementById("accept-cookie").addEventListener("click", function() {
        localStorage.setItem("cookieAccepted", "true");
        cookieBanner.style.display = "none";
    });

    // 判定ボタンの処理
    const judgeBtn = document.getElementById("judge-btn");
    if(judgeBtn) {
        judgeBtn.addEventListener("click", function() {
            const result = Math.random() < 0.5 ? "大吉" : "末吉";
            document.getElementById("result-text").textContent = result;
            document.getElementById("judgment-result").style.display = "block";
        });
    }

    // EmailJS初期化
    emailjs.init("YOUR_PUBLIC_KEY");

    // コンタクトフォームの処理
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const submitButton = this.querySelector('button[type="submit"]');
            const formMessage = document.getElementById('form-message');
            
            submitButton.disabled = true;
            
            // 基本的なバリデーション
            const name = this.querySelector('input[name="name"]').value;
            const email = this.querySelector('input[name="email"]').value;
            const message = this.querySelector('textarea[name="message"]').value;

            if (!validateForm(name, email, message)) {
                submitButton.disabled = false;
                return;
            }

            // EmailJSでメール送信
            emailjs.send(
                'YOUR_SERVICE_ID',
                'YOUR_TEMPLATE_ID',
                {
                    from_name: name,
                    from_email: email,
                    message: message,
                }
            ).then(
                function() {
                    formMessage.innerHTML = '<div class="alert success">メッセージを送信しました。</div>';
                    contactForm.reset();
                },
                function(error) {
                    console.error('送信エラー:', error);
                    formMessage.innerHTML = '<div class="alert error">送信に失敗しました。後でもう一度お試しください。</div>';
                }
            ).finally(() => {
                submitButton.disabled = false;
            });
        });
    }

    function validateForm(name, email, message) {
        if (name.length < 2 || name.length > 50) {
            alert('名前は2文字以上50文字以下で入力してください');
            return false;
        }

        if (message.length < 10 || message.length > 1000) {
            alert('メッセージは10文字以上1000文字以下で入力してください');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('有効なメールアドレスを入力してください');
            return false;
        }

        return true;
    }

    // CSRF対策のトークン生成
    function generateCSRFToken() {
        return Array.from(window.crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // ページ左端10pxにカーソルが入ったらメニューを展開する処理
    document.addEventListener("mousemove", function(e) {
        if (e.clientX < 10) {
            header.classList.add("nav-open");
        }
    });
});