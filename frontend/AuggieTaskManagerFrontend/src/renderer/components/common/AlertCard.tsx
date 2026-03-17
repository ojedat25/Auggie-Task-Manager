import { useEffect, useState } from "react";

type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertCardProps {
    type: AlertType;
    message: string;
}

export const AlertCard = ({ type, message }: AlertCardProps) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setIsVisible(false);
        }, 5000);
    }, [isVisible]);

    return (
        <div className={`toast fixed top-4 right-4 z-50 ${isVisible ? 'opacity-100' : 'opacity-0'}`} >
            <div className={`alert alert-${type}`}>
                <span>{message}</span>
            </div>
        </div>
    );
};
