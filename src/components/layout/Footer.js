import React from 'react';
import Card from '../common/Card';

const Footer = () => {
    return (
        <footer className="mt-auto p-4 no-print">
            <Card className="max-w-4xl mx-auto text-center text-xs text-on-surface-variant/80 p-4">
                <p>
                    Developed by :<br /> Sagar H R & Co. <br /> Chartered Accountants
                </p>
            </Card>
        </footer>
    );
};

export default Footer;