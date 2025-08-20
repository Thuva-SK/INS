import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Save, 
  Edit3, 
  X, 
  CheckCircle, 
  AlertCircle,
  Shield,
  Settings as SettingsIcon,
  Smartphone,
  Bell,
  Monitor,
  Key,
  Activity,
  Zap,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

interface Setting {
  id: string;
  key: string;
  value: string;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  emailNotifications: boolean;
  sessionManagement: boolean;
  loginNotifications: boolean;
  deviceTracking: boolean;
}

const Settings: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: (user as { name?: string })?.name || '',
    email: user?.email || '',
    password: '',
    currentPassword: '',
    name_changed: (user as { name_changed?: boolean })?.name_changed || false,
  });
  const [profileEdit, setProfileEdit] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [profileError, setProfileError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [session, setSession] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  
  // Security settings state
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    emailNotifications: true,
    sessionManagement: true,
    loginNotifications: true,
    deviceTracking: false,
  });
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState('');

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('settings').select('*');
    if (!error && data) setSettings(data);
    setLoading(false);
  }, []);

  // Fetch security settings from database
  const fetchSecuritySettings = useCallback(async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from('user_security_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (!error && data) {
      setSecuritySettings({
        twoFactorAuth: data.two_factor_auth || false,
        emailNotifications: data.email_notifications !== false, // default to true
        sessionManagement: data.session_management !== false, // default to true
        loginNotifications: data.login_notifications !== false, // default to true
        deviceTracking: data.device_tracking || false,
      });
    }
  }, [user?.id]);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session || null);
      setSessionChecked(true);
    };
    getSession();
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setSessionChecked(true);
    });
    const subscription = data?.subscription;
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (sessionChecked && !session) {
      navigate('/login');
    }
  }, [sessionChecked, session, navigate]);

  useEffect(() => {
    fetchSettings();
    fetchSecuritySettings();
    const channel = supabase.channel('settings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, fetchSettings)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_security_settings' }, fetchSecuritySettings)
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [user?.id, fetchSettings, fetchSecuritySettings]);

  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      name: (user as { name?: string })?.name || '',
      email: user?.email || '',
      name_changed: (user as { name_changed?: boolean })?.name_changed || false,
    }));
  }, [user]);

  const handleEdit = (setting: Setting) => {
    setEditing(setting.id);
    setEditValue(setting.value);
  };

  const handleSave = async (id: string) => {
    await supabase.from('settings').update({ value: editValue }).eq('id', id);
    setEditing(null);
    setEditValue('');
    fetchSettings();
  };

  // Handle security setting toggle
  const handleSecurityToggle = async (setting: keyof SecuritySettings, value: boolean) => {
    if (!user?.id) return;
    
    setSecurityLoading(true);
    setSecuritySuccess('');
    
    try {
      // Update local state immediately for better UX
      setSecuritySettings(prev => ({ ...prev, [setting]: value }));
      
      // Map frontend setting names to database column names
      const dbColumnMap: Record<keyof SecuritySettings, string> = {
        twoFactorAuth: 'two_factor_auth',
        emailNotifications: 'email_notifications',
        sessionManagement: 'session_management',
        loginNotifications: 'login_notifications',
        deviceTracking: 'device_tracking',
      };
      
      const dbColumn = dbColumnMap[setting];
      const updateData = { [dbColumn]: value };
      
      // Upsert the security setting
      const { error } = await supabase
        .from('user_security_settings')
        .upsert({
          user_id: user.id,
          ...updateData,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });
      
      if (error) {
        // Revert local state if database update fails
        setSecuritySettings(prev => ({ ...prev, [setting]: !value }));
        console.error('Failed to update security setting:', error);
      } else {
        setSecuritySuccess(`${setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} ${value ? 'enabled' : 'disabled'} successfully!`);
        setTimeout(() => setSecuritySuccess(''), 3000);
      }
    } catch (error) {
      // Revert local state if there's an error
      setSecuritySettings(prev => ({ ...prev, [setting]: !value }));
      console.error('Error updating security setting:', error);
    } finally {
      setSecurityLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    // This would typically open a password change modal
    // For now, we'll just show a placeholder
    setSecuritySuccess('Password change functionality will be implemented here');
    setTimeout(() => setSecuritySuccess(''), 3000);
  };

  // Handle view sessions
  const handleViewSessions = async () => {
    // This would typically open a sessions modal
    // For now, we'll just show a placeholder
    setSecuritySuccess('Session management will be implemented here');
    setTimeout(() => setSecuritySuccess(''), 3000);
  };

  // Real profile update handler with validation and Supabase integration
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileLoading(true);
    
    // Validation
    if (!profile.name || profile.name.length < 2) {
      setProfileError('Name must be at least 2 characters.');
      setProfileLoading(false);
      return;
    }
    if (!profile.email.match(/^[^@]+@[^@]+\.[^@]+$/)) {
      setProfileError('Invalid email address.');
      setProfileLoading(false);
      return;
    }
    if ((profile.password || profile.email !== user?.email) && !profile.currentPassword) {
      setProfileError('Current password is required to change email or password.');
      setProfileLoading(false);
      return;
    }
    if (profile.password && profile.password.length < 6) {
      setProfileError('Password must be at least 6 characters.');
      setProfileLoading(false);
      return;
    }
    
    // Real re-authentication with Supabase
    if (profile.password || profile.email !== user?.email) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: profile.currentPassword,
      });
      if (signInError) {
        setProfileError('Current password is incorrect.');
        setProfileLoading(false);
        return;
      }
    }
    
    // Update email and password in Supabase auth
    const { error: authError } = await supabase.auth.updateUser({
      email: profile.email,
      password: profile.password || undefined,
    });
    if (authError) {
      setProfileError(authError.message);
      setProfileLoading(false);
      return;
    }
    
    // Update name in users table (if you have a users table)
    if (user?.id) {
      const updateObj: { name: string; name_changed?: boolean } = { name: profile.name };
      if (!(user as { name_changed?: boolean })?.name_changed) {
        updateObj.name_changed = true;
      }
      const { error: nameError } = await supabase
        .from('users')
        .update(updateObj)
        .eq('id', user.id);
      if (nameError) {
        setProfileError(nameError.message);
        setProfileLoading(false);
        return;
      }
    }
    
    setProfileLoading(false);
    setProfileEdit(false);
    setProfileSuccess('Profile updated successfully!');
    setTimeout(() => setProfileSuccess(''), 3000);
    if (setUser) {
      setUser({ ...user, ...(profile as { name: string; email: string; name_changed: boolean }) });
    }
  };

  const handleCancelEdit = () => {
    setProfileEdit(false);
    setProfile({
      name: (user as { name?: string })?.name || '',
      email: user?.email || '',
      password: '',
      currentPassword: '',
      name_changed: (user as { name_changed?: boolean })?.name_changed || false,
    });
    setProfileError('');
    setShowPassword(false);
    setShowCurrentPassword(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="space-y-8 p-6 pt-20">
        {/* Modern Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/50 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <SettingsIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-lg">
                  Manage your account and preferences with ease
                </p>
              </div>
              <div className="ml-auto">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Profile Section - Modern Card */}
          <Card className="group relative overflow-hidden border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Profile Information
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Update your personal information and credentials
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative space-y-6">
              {profileEdit ? (
                <form onSubmit={handleProfileSave} className="space-y-6">
                  {/* Name Field */}
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Full Name
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={profile.name}
                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                        className="pl-12 h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-all duration-300 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                        required
                        disabled={profile.name_changed}
                      />
                    </div>
                    {profile.name_changed && (
                      <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        You can only change your name once. It is now permanent.
                      </div>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Email Address
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={profile.email}
                        onChange={e => setProfile({ ...profile, email: e.target.value })}
                        className="pl-12 h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-all duration-300 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {profileError && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span className="text-sm text-red-600 dark:text-red-400">{profileError}</span>
                    </div>
                  )}

                  {/* Success Message */}
                  {profileSuccess && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-green-600 dark:text-green-400">{profileSuccess}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={profileLoading}
                      className="flex-1 h-12 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all duration-300"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={profileLoading || !session}
                      className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      {profileLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Profile Display */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-600/50">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</span>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{profile.name}</p>
                        </div>
                      </div>
                      {profile.name_changed && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Permanent
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-600/50">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                          <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</span>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{profile.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setProfileEdit(true)}
                    variant="outline"
                    className="w-full h-12 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-xl transition-all duration-300 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600/50 dark:hover:to-gray-700/50"
                    disabled={profile.name_changed}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security & Preferences Section - Modern Card */}
          <Card className="group relative overflow-hidden border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Security & Preferences
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Manage your security settings and preferences
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative space-y-6">
              {/* Success Message */}
              {securitySuccess && (
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl animate-in slide-in-from-top-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-green-600 dark:text-green-400">{securitySuccess}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Two-Factor Authentication */}
                <div className="group/item flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-600/50 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover/item:scale-110 transition-transform duration-300">
                      <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Two-Factor Authentication</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
                    </div>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => handleSecurityToggle('twoFactorAuth', checked)}
                    disabled={securityLoading}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
                
                {/* Email Notifications */}
                <div className="group/item flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-600/50 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover/item:scale-110 transition-transform duration-300">
                      <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Email Notifications</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Receive important updates via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={securitySettings.emailNotifications}
                    onCheckedChange={(checked) => handleSecurityToggle('emailNotifications', checked)}
                    disabled={securityLoading}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>
                
                {/* Session Management */}
                <div className="group/item flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-600/50 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover/item:scale-110 transition-transform duration-300">
                      <Monitor className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Session Management</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Track and manage active sessions</p>
                    </div>
                  </div>
                  <Switch
                    checked={securitySettings.sessionManagement}
                    onCheckedChange={(checked) => handleSecurityToggle('sessionManagement', checked)}
                    disabled={securityLoading}
                    className="data-[state=checked]:bg-purple-500"
                  />
                </div>

                {/* Login Notifications */}
                <div className="group/item flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-600/50 hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl group-hover/item:scale-110 transition-transform duration-300">
                      <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Login Notifications</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Get notified of new login attempts</p>
                    </div>
                  </div>
                  <Switch
                    checked={securitySettings.loginNotifications}
                    onCheckedChange={(checked) => handleSecurityToggle('loginNotifications', checked)}
                    disabled={securityLoading}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>

                {/* Device Tracking */}
                <div className="group/item flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-600/50 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl group-hover/item:scale-110 transition-transform duration-300">
                      <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Device Tracking</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Track devices used to access your account</p>
                    </div>
                  </div>
                  <Switch
                    checked={securitySettings.deviceTracking}
                    onCheckedChange={(checked) => handleSecurityToggle('deviceTracking', checked)}
                    disabled={securityLoading}
                    className="data-[state=checked]:bg-indigo-500"
                  />
                </div>
              </div>

              <Separator className="my-6 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Quick Actions
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-12 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all duration-300 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600/50 dark:hover:to-gray-700/50"
                    onClick={handlePasswordChange}
                    disabled={securityLoading}
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-12 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all duration-300 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600/50 dark:hover:to-gray-700/50"
                    onClick={handleViewSessions}
                    disabled={securityLoading}
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    View Sessions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings; 