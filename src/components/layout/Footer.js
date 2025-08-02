import React from 'react';

const Footer = () => {
    return (
        <footer className="mt-auto p-2 md:p-4 no-print">
            <div className="max-w-8xl mx-auto text-center text-on-surface-variant/80 p-4 md:p-6 bg-surface-container/50 border-t border-outline-variant rounded-2xl">
                <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                    <div className="text-center">
                        <p className="text-on-surface-variant">
                            Developed by: <br className="sm:hidden" />
                            <span className="font-semibold text-primary">Sagar H R & Co., Chartered Accountants</span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;