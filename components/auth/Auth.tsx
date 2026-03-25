
import React, { useState, useCallback } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { validateEmail, validateRequired, validatePasswordStrength } from '../../utils/validation';
import { Zap, Check } from 'lucide-react';

interface AuthProps {
    onLogin: (email: string, pass: string) => boolean;
    onSignup: (email: string, pass: string, name: string) => boolean;
    onGoogleLogin: () => void;
    onCheckUserExists: (email: string) => boolean;
    onResetPassword: (email: string, newPass: string) => boolean;
}

type AuthView = 'login' | 'signup' | 'forgotPassword' | 'resetPassword' | 'resetSuccess';

// --- Brand Logo ---
const BrandLogo = ({ size = 'md', dark = false }: { size?: 'sm' | 'md' | 'lg'; dark?: boolean }) => {
    const dim = size === 'lg' ? 'h-10 w-10' : size === 'md' ? 'h-8 w-8' : 'h-6 w-6';
    const text = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-xl' : 'text-lg';
    
    return (
        <div className="flex items-center gap-3">
            <div className={`bg-accent text-white p-1.5 rounded-lg shadow-sm ${dim} flex items-center justify-center`}>
                <Zap className="w-full h-full" strokeWidth={2.5} />
            </div>
            <span className={`font-bold tracking-tight ${dark ? 'text-white' : 'text-slate-900 dark:text-white'} ${text}`}>InvoicePro</span>
        </div>
    );
};

// --- Main Auth Component ---
const Auth: React.FC<AuthProps> = ({ onLogin, onSignup, onGoogleLogin, onCheckUserExists, onResetPassword }) => {
    const [authView, setAuthView] = useState<AuthView>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formError, setFormError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ email?: string, password?: string, confirmPassword?: string, name?: string }>({});
    const [emailToReset, setEmailToReset] = useState('');

    const switchView = (view: AuthView) => {
        setAuthView(view);
        setFormError('');
        setFieldErrors({});
    };

    const validateAndSetField = useCallback((
        fieldName: 'email' | 'password' | 'confirmPassword' | 'name', 
        value: string, 
        isSignupOrReset: boolean = false
    ) => {
        let error: string | null = null;
        if (fieldName === 'email') {
            error = validateRequired(value) || validateEmail(value);
        } else if (fieldName === 'password') {
            error = validateRequired(value);
            if (!error && isSignupOrReset) {
                error = validatePasswordStrength(value);
            }
        } else if (fieldName === 'confirmPassword') {
            error = validateRequired(value);
            if (!error && value !== password) {
                error = "Passwords do not match.";
            }
        } else if (fieldName === 'name') {
            error = validateRequired(value);
        }
        setFieldErrors(prev => ({ ...prev, [fieldName]: error || undefined }));
        return !error;
    }, [password]);

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        const isEmailValid = validateAndSetField('email', email);
        const isPasswordValid = validateAndSetField('password', password);
        if (!isEmailValid || !isPasswordValid) return;

        if (!onLogin(email, password)) {
            setFormError('Invalid email or password.');
        }
    };
    
    const handleSignupSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        const isNameValid = validateAndSetField('name', name);
        const isEmailValid = validateAndSetField('email', email);
        const isPasswordValid = validateAndSetField('password', password, true);
        if (!isNameValid || !isEmailValid || !isPasswordValid) return;

        if (!onSignup(email, password, name)) {
            setFormError('Could not sign up. The email might already be in use.');
        }
    };
    
    const handleForgotPasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        const isEmailValid = validateAndSetField('email', email);
        if(!isEmailValid) return;

        if(onCheckUserExists(email)) {
            setEmailToReset(email);
            switchView('resetPassword');
        } else {
            setFormError("No account found with that email address.");
        }
    };
    
    const handleResetPasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        const isPasswordValid = validateAndSetField('password', password, true);
        const isConfirmPasswordValid = validateAndSetField('confirmPassword', confirmPassword);
        
        if (!isPasswordValid || !isConfirmPasswordValid) return;

        if(onResetPassword(emailToReset, password)) {
            switchView('resetSuccess');
        } else {
            setFormError("Could not reset password. Please try again.");
        }
    };

    return (
        <div className="flex min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-accent selection:text-white">
            
            {/* Left Side (Brand & Visuals) */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative flex-col justify-between p-16 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 z-0 opacity-20">
                    <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]"></div>
                </div>
                
                {/* Top: Logo */}
                <div className="relative z-10">
                    <BrandLogo size="lg" dark={true} />
                </div>

                {/* Middle: Content */}
                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl font-bold text-white tracking-tight leading-tight mb-6">
                        Automate your <br/>
                        <span className="text-accent">financial workflow.</span>
                    </h1>
                    <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                        Create invoices, track expenses, and manage your inventory with a platform designed for modern businesses.
                    </p>
                    
                    <div className="flex gap-4">
                        <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                            <p className="text-2xl font-bold text-white">10k+</p>
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Invoices Generated</p>
                        </div>
                        <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                            <p className="text-2xl font-bold text-white">99.9%</p>
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Uptime</p>
                        </div>
                    </div>
                </div>

                {/* Bottom: Footer */}
                <div className="relative z-10 text-sm text-slate-500">
                    © {new Date().getFullYear()} InvoicePro. Trusted by 2,000+ companies.
                </div>
            </div>

            {/* Right Side (Action / Form) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
                <div className="w-full max-w-md space-y-8">
                    
                    {/* Mobile Header */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-block"><BrandLogo size="lg" /></div>
                    </div>

                    {/* Form Container */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-none sm:shadow-lg sm:border border-slate-200 dark:border-slate-800 p-0 sm:p-10">
                        
                        {/* Auth Switcher (Tabs) */}
                        {(authView === 'login' || authView === 'signup') && (
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mb-8">
                                <button
                                    onClick={() => switchView('login')}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${authView === 'login' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => switchView('signup')}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${authView === 'signup' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}

                        {/* LOGIN VIEW */}
                        {authView === 'login' && (
                            <form onSubmit={handleLoginSubmit} className="space-y-5">
                                <div className="space-y-4">
                                    <Input label="Email Address" id="email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); validateAndSetField('email', e.target.value); }} required placeholder="you@company.com" error={fieldErrors.email} />
                                    <div>
                                        <Input label="Password" id="password" type="password" value={password} onChange={(e) => { setPassword(e.target.value); validateAndSetField('password', e.target.value); }} required placeholder="••••••••" error={fieldErrors.password} />
                                        <div className="flex justify-end mt-2">
                                            <button type="button" onClick={() => switchView('forgotPassword')} className="text-xs font-semibold text-accent hover:text-accent-hover">Forgot password?</button>
                                        </div>
                                    </div>
                                </div>

                                {formError && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm font-medium rounded-lg text-center">{formError}</div>}

                                <Button type="submit" className="w-full py-3 text-base shadow-md">Sign In</Button>

                                <div className="relative flex items-center justify-center my-6">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
                                    <span className="relative bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 font-medium">OR CONTINUE WITH</span>
                                </div>

                                <Button type="button" variant="secondary" className="w-full flex items-center justify-center gap-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50" onClick={onGoogleLogin}>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                    <span className="text-slate-700 dark:text-slate-200">Google</span>
                                </Button>
                            </form>
                        )}

                        {/* SIGNUP VIEW */}
                        {authView === 'signup' && (
                            <form onSubmit={handleSignupSubmit} className="space-y-5">
                                <div className="space-y-4">
                                    <Input label="Full Name" id="name" type="text" value={name} onChange={(e) => { setName(e.target.value); validateAndSetField('name', e.target.value); }} required placeholder="John Doe" error={fieldErrors.name} />
                                    <Input label="Email Address" id="email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); validateAndSetField('email', e.target.value); }} required placeholder="you@company.com" error={fieldErrors.email} />
                                    <Input label="Create Password" id="password" type="password" value={password} onChange={(e) => { setPassword(e.target.value); validateAndSetField('password', e.target.value, true); }} required placeholder="Min 8 characters" error={fieldErrors.password} />
                                </div>

                                {formError && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm font-medium rounded-lg text-center">{formError}</div>}

                                <Button type="submit" className="w-full py-3 text-base shadow-md">Create Account</Button>
                                <p className="text-center text-xs text-slate-500">By signing up, you agree to our Terms & Privacy Policy.</p>
                            </form>
                        )}

                        {/* FORGOT PASSWORD VIEW */}
                        {authView === 'forgotPassword' && (
                            <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Reset Password</h3>
                                    <p className="text-sm text-slate-500 mt-2">Enter your email to receive reset instructions.</p>
                                </div>
                                <Input label="Email Address" id="email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); validateAndSetField('email', e.target.value); }} required placeholder="you@company.com" error={fieldErrors.email} />
                                
                                {formError && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm font-medium rounded-lg text-center">{formError}</div>}
                                
                                <Button type="submit" className="w-full py-3 text-base shadow-md">Send Link</Button>
                                <button type="button" onClick={() => switchView('login')} className="w-full text-center text-sm font-medium text-slate-500 hover:text-slate-800 mt-4">Back to Sign In</button>
                            </form>
                        )}

                        {/* RESET PASSWORD VIEW */}
                        {authView === 'resetPassword' && (
                            <form onSubmit={handleResetPasswordSubmit} className="space-y-6">
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">New Password</h3>
                                    <p className="text-sm text-slate-500 mt-2">Set a new password for <strong>{emailToReset}</strong></p>
                                </div>
                                <div className="space-y-4">
                                    <Input label="New Password" id="password" type="password" value={password} onChange={(e) => { setPassword(e.target.value); validateAndSetField('password', e.target.value, true); }} required placeholder="New password" error={fieldErrors.password} />
                                    <Input label="Confirm Password" id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); validateAndSetField('confirmPassword', e.target.value); }} required placeholder="Confirm password" error={fieldErrors.confirmPassword} />
                                </div>
                                {formError && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm font-medium rounded-lg text-center">{formError}</div>}
                                <Button type="submit" className="w-full py-3 text-base shadow-md">Update Password</Button>
                            </form>
                        )}

                        {/* SUCCESS VIEW */}
                        {authView === 'resetSuccess' && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check className="w-8 h-8 text-green-600 dark:text-green-400" strokeWidth={2} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Password Updated</h3>
                                <p className="text-sm text-slate-500 mb-8">Your password has been successfully reset.</p>
                                <Button onClick={() => switchView('login')} className="w-full py-3 text-base shadow-md">Back to Sign In</Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
