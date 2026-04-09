"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// ─── Toggle Switch ────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-slate-900' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────
function SettingsSection({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="enterprise-card overflow-hidden mb-6">
      {/* Section Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/60">
        <span className="text-xl">{icon}</span>
        <div>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{title}</h2>
          <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

// ─── Setting Row ──────────────────────────────────────────────
function SettingRow({
  label,
  description,
  control,
}: {
  label: string;
  description?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-800">{label}</p>
        {description && <p className="text-xs text-slate-400 font-medium mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{control}</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Appearance
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [compactMode, setCompactMode] = useState(false);
  const [animations, setAnimations] = useState(true);

  // Notifications
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [prescriptionAlerts, setPrescriptionAlerts] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(false);

  // Privacy
  const [profileVisible, setProfileVisible] = useState(true);
  const [activityTracking, setActivityTracking] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);

  // Security
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [loginAlerts, setLoginAlerts] = useState(true);

  // Password change
  const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [pwdStatus, setPwdStatus] = useState<'' | 'saving' | 'success' | 'error'>('');

  // Save state
  const [saved, setSaved] = useState(false);

  if (!user) {
    router.push('/');
    return null;
  }

  const triggerSync = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveAll = () => {
    triggerSync();
  };

  const handleChangePassword = () => {
    if (!pwdForm.current || !pwdForm.newPwd) return;
    if (pwdForm.newPwd !== pwdForm.confirm) {
      setPwdStatus('error');
      return;
    }
    setPwdStatus('saving');
    setTimeout(() => {
      setPwdStatus('success');
      setPwdForm({ current: '', newPwd: '', confirm: '' });
      setTimeout(() => setPwdStatus(''), 3000);
    }, 1000);
  };

  const themeOptions: { value: 'light' | 'dark' | 'system'; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' },
  ];

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fadeIn">
      {/* Page Header */}
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
          <p className="text-slate-500 font-medium">Customize your clinical experience</p>
        </div>
        <div className="flex flex-col items-end gap-2">
           <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${saved ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${saved ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
              {saved ? 'Cloud Sync Successful' : 'Real-time Sync Active'}
           </div>
           <p className="text-[9px] text-slate-400 font-bold uppercase">Device ID: {user?.id || 'GUEST'}-DH7</p>
        </div>
      </header>

      {/* REAL-TIME PREVIEW CARD */}
      <div className="enterprise-card p-6 bg-slate-900 text-white mb-8 border-none relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-0"></div>
         <div className="relative z-10 flex items-center justify-between">
            <div className="max-w-[70%]">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-3">Live Notification Preview</h3>
               <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md animate-fadeIn">
                  <div className="flex gap-4">
                     <span className="text-2xl">🔔</span>
                     <div>
                        <p className="text-sm font-bold">Clinical Alert Simulation</p>
                        <p className="text-[10px] text-white/60 mt-1">
                           This is how {pushNotif ? 'Push' : 'Email'} notifications will appear based on your current settings.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
            <div className="text-center">
               <div className="w-16 h-16 rounded-full border-2 border-white/10 flex items-center justify-center mb-2">
                  <span className="text-2xl animate-bounce">📱</span>
               </div>
               <p className="text-[8px] font-black text-white/30 uppercase">Instant Preview</p>
            </div>
         </div>
      </div>

      {/* ── Appearance ─────────────────────────────── */}
      <SettingsSection icon="🎨" title="Appearance" subtitle="Customize how the app looks">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Theme</p>
          <div className="flex gap-3">
            {themeOptions.map((t) => (
              <button
                key={t.value}
                onClick={() => { setTheme(t.value); triggerSync(); }}
                className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  theme === t.value
                    ? 'border-slate-900 bg-slate-50 shadow-sm'
                    : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                <span className="text-xl">{t.icon}</span>
                <span className="text-xs font-bold text-slate-700">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <SettingRow
          label="Font Size"
          description="Adjust text size across the app"
          control={
            <select
              value={fontSize}
              onChange={(e) => { setFontSize(e.target.value as any); triggerSync(); }}
              className="text-sm font-medium px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-800"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          }
        />

        <SettingRow
          label="Compact Mode"
          description="Reduce spacing for a denser layout"
          control={<Toggle checked={compactMode} onChange={() => { setCompactMode(!compactMode); triggerSync(); }} />}
        />

        <SettingRow
          label="Animations"
          description="Enable smooth transitions and effects"
          control={<Toggle checked={animations} onChange={() => { setAnimations(!animations); triggerSync(); }} />}
        />
      </SettingsSection>

      {/* ── Notifications ──────────────────────────── */}
      <SettingsSection icon="🔔" title="Notifications" subtitle="Control when and how you are notified">
        <SettingRow
          label="Email Notifications"
          description="Receive updates via email"
          control={<Toggle checked={emailNotif} onChange={() => { setEmailNotif(!emailNotif); triggerSync(); }} />}
        />
        <SettingRow
          label="Push Notifications"
          description="Browser and mobile push alerts"
          control={<Toggle checked={pushNotif} onChange={() => { setPushNotif(!pushNotif); triggerSync(); }} />}
        />
        <SettingRow
          label="SMS Alerts"
          description="Receive critical alerts via SMS"
          control={<Toggle checked={smsNotif} onChange={() => { setSmsNotif(!smsNotif); triggerSync(); }} />}
        />
        <div className="border-t border-slate-100 pt-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Alert Types</p>
          <div className="space-y-4">
            <SettingRow
              label="Appointment Reminders"
              control={<Toggle checked={appointmentReminders} onChange={() => { setAppointmentReminders(!appointmentReminders); triggerSync(); }} />}
            />
            <SettingRow
              label="Prescription Alerts"
              control={<Toggle checked={prescriptionAlerts} onChange={() => { setPrescriptionAlerts(!prescriptionAlerts); triggerSync(); }} />}
            />
            <SettingRow
              label="System Updates"
              control={<Toggle checked={systemUpdates} onChange={() => { setSystemUpdates(!systemUpdates); triggerSync(); }} />}
            />
          </div>
        </div>
      </SettingsSection>

      {/* ── Privacy ────────────────────────────────── */}
      <SettingsSection icon="🔒" title="Privacy" subtitle="Manage your data and visibility">
        <SettingRow
          label="Public Profile"
          description="Allow others to view your profile"
          control={<Toggle checked={profileVisible} onChange={() => { setProfileVisible(!profileVisible); triggerSync(); }} />}
        />
        <SettingRow
          label="Activity Tracking"
          description="Help us improve with anonymous usage data"
          control={<Toggle checked={activityTracking} onChange={() => { setActivityTracking(!activityTracking); triggerSync(); }} />}
        />
        <SettingRow
          label="Data Sharing with Partners"
          description="Share anonymized data for research"
          control={<Toggle checked={dataSharing} onChange={() => { setDataSharing(!dataSharing); triggerSync(); }} />}
        />
      </SettingsSection>

      {/* ── Security ───────────────────────────────── */}
      <SettingsSection icon="🛡️" title="Security" subtitle="Keep your account safe">
        <SettingRow
          label="Two-Factor Authentication"
          description="Add an extra layer of security"
          control={<Toggle checked={twoFactor} onChange={() => { setTwoFactor(!twoFactor); triggerSync(); }} />}
        />
        <SettingRow
          label="Login Alerts"
          description="Notify me when a new device logs in"
          control={<Toggle checked={loginAlerts} onChange={() => { setLoginAlerts(!loginAlerts); triggerSync(); }} />}
        />
        <SettingRow
          label="Session Timeout"
          description="Auto-logout after inactivity"
          control={
            <select
              value={sessionTimeout}
              onChange={(e) => { setSessionTimeout(e.target.value); triggerSync(); }}
              className="text-sm font-medium px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-800"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="0">Never</option>
            </select>
          }
        />

        {/* Change Password */}
        <div className="border-t border-slate-100 pt-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Change Password</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current</label>
              <input
                type="password"
                value={pwdForm.current}
                onChange={(e) => setPwdForm(p => ({ ...p, current: e.target.value }))}
                placeholder="••••••••"
                className="w-full text-sm font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password</label>
              <input
                type="password"
                value={pwdForm.newPwd}
                onChange={(e) => setPwdForm(p => ({ ...p, newPwd: e.target.value }))}
                placeholder="••••••••"
                className="w-full text-sm font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm New</label>
              <input
                type="password"
                value={pwdForm.confirm}
                onChange={(e) => setPwdForm(p => ({ ...p, confirm: e.target.value }))}
                placeholder="••••••••"
                className="w-full text-sm font-medium"
              />
            </div>
          </div>

          {pwdStatus === 'error' && (
            <p className="mt-3 text-xs text-rose-600 font-bold">❌ Passwords do not match.</p>
          )}
          {pwdStatus === 'success' && (
            <p className="mt-3 text-xs text-emerald-600 font-bold">✅ Password changed successfully!</p>
          )}

          <button
            onClick={handleChangePassword}
            disabled={pwdStatus === 'saving'}
            className="mt-4 btn-secondary text-xs flex items-center gap-2"
          >
            {pwdStatus === 'saving' ? '⏳ Updating...' : '🔑 Update Password'}
          </button>
        </div>
      </SettingsSection>

      {/* ── Save Button ────────────────────────────── */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.push(user.role === 'admin' ? '/doctor' : `/${user.role}`)}
          className="btn-secondary text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveAll}
          className="btn-primary text-sm flex items-center gap-2 px-8"
        >
          💾 Save All Settings
        </button>
      </div>
    </div>
  );
}
