import React, { ReactNode } from 'react';

const Container = ({ children }: { children: ReactNode }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center pt-24 lg:pt-32 pb-12 px-4 md:px-8">
            {children}
        </div>
    );
};

export default Container;