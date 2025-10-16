import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
    const sizeClass = {
        small: 'loading-spinner--small',
        medium: 'loading-spinner--medium',
        large: 'loading-spinner--large'
    }[size];

    return (
        <div className={`loading-spinner ${sizeClass}`}>
            <div className="loading-spinner__animation"></div>
            <p className="loading-spinner__message">{message}</p>
        </div>
    );
};

export default LoadingSpinner;
