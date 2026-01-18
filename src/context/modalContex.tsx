'use client';

import { createContext, useContext, useState, useCallback } from "react";

type ModalContextType = {
    isLoginOpen: boolean;
    isSignin: boolean;
    openLogin: (signin?: boolean) => void;
    closeLogin: () => void;
    switchForm: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isSignin, setIsSignin] = useState(true);
    
    const openLogin = useCallback((signin = true) => {
        setIsSignin(signin);
        setIsLoginOpen(true);
        // Блокируем прокрутку body при открытии модалки
        document.body.style.overflow = 'hidden';
    }, []);
    
    const closeLogin = useCallback(() => {
        setIsLoginOpen(false);
        // Возвращаем прокрутку body
        document.body.style.overflow = 'unset';
    }, []);
    
    const switchForm = useCallback(() => {
        setIsSignin(!isSignin);
    }, [isSignin]);
    
    return (
        <ModalContext.Provider value={{ 
            isLoginOpen, 
            isSignin,
            openLogin, 
            closeLogin,
            switchForm 
        }}>
            {children}
        </ModalContext.Provider>
    );
}

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context)
        throw new Error("useModal должен быть внутри ModalProvider");
    return context;
};