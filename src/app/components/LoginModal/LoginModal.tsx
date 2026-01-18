'use client'

import { useModal } from "@/context/modalContex"
import style from './style.module.css'
import { useEffect } from 'react'
import { useAppSelector } from '@/store/store'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Динамическая загрузка форм
const SigninForm = dynamic(() => import('@/app/auth/signin/page'), {
  loading: () => <div className={style.loading}>Загрузка...</div>,
  ssr: false
})

const SignupForm = dynamic(() => import('@/app/auth/signup/page'), {
  loading: () => <div className={style.loading}>Загрузка...</div>,
  ssr: false
})

export default function LoginModal() {
  const { isLoginOpen, closeLogin, isSignin, switchForm } = useModal()
  const { isAuth } = useAppSelector((state) => state.auth)
  
  // Закрываем модалку при успешной авторизации
  useEffect(() => {
    if (isAuth && isLoginOpen) {
      closeLogin()
    }
  }, [isAuth, isLoginOpen, closeLogin])

  if (!isLoginOpen) return null

  return (
    <div className={style.modalOverlay} onClick={closeLogin}>
      <div className={style.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={style.closeButton} onClick={closeLogin}>
          ✕
        </button>
        
        <Suspense fallback={<div className={style.loading}>Загрузка формы...</div>}>
          {isSignin ? (
            <div className={`${style.modal__form} ${style.signin}`}>
              <SigninForm />
              <div className={style.switchForm}>
                <button 
                  onClick={switchForm}
                  className={style.switchButton}
                >
                  Зарегистрироваться
                </button>
              </div>
            </div>
          ) : (
            <div className={`${style.modal__form} ${style.signup}`}>
              <SignupForm />
              <div className={style.switchForm}>
                <button 
                  onClick={switchForm}
                  className={style.switchButton}
                >
                  Войти
                </button>
              </div>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  )
}