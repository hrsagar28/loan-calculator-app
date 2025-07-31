import React from 'react';
import { icons } from '../../constants/icons';

const Footer = () => {
    return (
        <footer className="mt-auto p-2 md:p-4 no-print">
            <div className="max-w-8xl mx-auto text-center text-on-surface-variant/80 p-4 md:p-6 bg-surface-container/50 border-t border-outline-variant rounded-2xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary text-on-primary">
                            <icons.LoanLogo className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-primary font-display">
                            Loan Advisory Tool
                        </h3>
                    </div>
                    <div className="text-xs md:text-right">
                        <p>
                            Developed by: <br className="sm:hidden" />
                            <span className="font-semibold">Sagar H R & Co.,</span> <br className="hidden md:block" />
                            <span className="font-semibold">Chartered Accountants</span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;