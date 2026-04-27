/**
 * ContactForm — a public-facing contact form that sends email via
 * the sendContactEmail GraphQL mutation → Resend API → inbox.
 *
 * Form state is managed with plain React useState — no form library needed
 * for something this size. Each field validates on blur so the user only
 * sees errors after they've had a chance to fill in the field.
 */
import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { SEND_CONTACT_EMAIL } from '../lib/queries';

interface FormState {
  name:    string;
  email:   string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?:    string;
  email?:   string;
  subject?: string;
  message?: string;
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim())                         errors.name    = 'Your name is required';
  if (!form.email.trim())                        errors.email   = 'Your email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                                 errors.email   = 'Please enter a valid email';
  if (!form.subject.trim())                      errors.subject = 'A subject is required';
  if (form.message.trim().length < 10)           errors.message = 'Message must be at least 10 characters';
  return errors;
}

const inputClass = `
  w-full bg-[#0F1A08] border border-[#D4AF37]/20 rounded-xl px-4 py-3
  text-[#F5F0E8] text-sm placeholder-[#F5F0E8]/25
  focus:outline-none focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/30
  transition-colors duration-200
`.trim();

const errorClass = 'text-red-400/80 text-xs mt-1';

export const ContactForm: React.FC = () => {
  const [form, setForm]       = useState<FormState>({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors]   = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus]   = useState<'idle' | 'success' | 'error'>('idle');

  const [sendEmail, { loading }] = useMutation(SEND_CONTACT_EMAIL);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    // Re-validate the field that just changed if it's already been touched
    if (touched[name]) {
      const updated = { ...form, [name]: value };
      const newErrors = validate(updated);
      setErrors(prev => ({ ...prev, [name]: newErrors[name as keyof FormErrors] }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched(t => ({ ...t, [name]: true }));
    const newErrors = validate(form);
    setErrors(prev => ({ ...prev, [name]: newErrors[name as keyof FormErrors] }));
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    // Mark everything touched so all errors show
    setTouched({ name: true, email: true, subject: true, message: true });
    const newErrors = validate(form);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await sendEmail({ variables: { input: form } });
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
      setTouched({});
      setErrors({});
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <CheckCircle size={40} className="text-[#7A9B00]" />
        <h3 className="text-white text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
          Message sent!
        </h3>
        <p className="text-[#F5F0E8]/50 text-sm max-w-xs">
          Thanks for reaching out. We'll get back to you as soon as possible.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-2 px-5 py-2 rounded-xl border border-[#D4AF37]/25 text-[#D4AF37] text-sm hover:bg-[#D4AF37]/10 transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {status === 'error' && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
          <AlertCircle size={15} />
          Something went wrong. Please try again or email us directly.
        </div>
      )}

      {/* Name + Email row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <input
            name="name"
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass}
            autoComplete="name"
          />
          {touched.name && errors.name && <p className={errorClass}>{errors.name}</p>}
        </div>
        <div>
          <input
            name="email"
            type="email"
            placeholder="Your email"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass}
            autoComplete="email"
          />
          {touched.email && errors.email && <p className={errorClass}>{errors.email}</p>}
        </div>
      </div>

      {/* Subject */}
      <div>
        <input
          name="subject"
          type="text"
          placeholder="Subject — e.g. Sponsorship inquiry, Media request"
          value={form.subject}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputClass}
        />
        {touched.subject && errors.subject && <p className={errorClass}>{errors.subject}</p>}
      </div>

      {/* Message */}
      <div>
        <textarea
          name="message"
          rows={5}
          placeholder="Your message..."
          value={form.message}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`${inputClass} resize-none`}
        />
        {touched.message && errors.message && <p className={errorClass}>{errors.message}</p>}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
          bg-[#D4AF37] hover:bg-[#e8c84a] active:bg-[#c49d2a]
          text-[#0F1A08] font-bold text-sm
          transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? <><Loader size={15} className="animate-spin" /> Sending...</>
          : <><Send size={15} /> Send message</>
        }
      </button>
    </div>
  );
};
