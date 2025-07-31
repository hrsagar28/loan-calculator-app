import React from 'react';

const Footer = () => {
    return (
        <footer className="mt-auto p-4 no-print">
            <div className="max-w-4xl mx-auto text-center p-6 rounded-2xl bg-surface-container text-on-surface-variant shadow-lg border-glass">
                <p className="font-display font-bold text-lg text-primary">Sagar H R & Co.</p>
                <p className="text-sm text-on-surface-variant">Chartered Accountants</p>
                <div className="mt-4 text-xs text-on-surface-variant/80">
                    <p>This tool is for advisory purposes only. Please consult with a financial advisor for professional advice.</p>
                    <p>&copy; {new Date().getFullYear()} Sagar H R & Co. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;