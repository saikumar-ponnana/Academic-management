import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Settings, Save, CheckCircle2, Clock, Globe, Building2, Plus, Trash2, Lock, Eye, EyeOff, ShieldCheck, KeyRound, AlertCircle, Database, RefreshCw } from 'lucide-react';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    institutionName: '',
    timezone: 'Asia/Kolkata',
    attendanceCutoff: '19:00',
    minimumAttendancePercentage: 75,
    maxUploadSizeMB: 10
  });
  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept] = useState({ code: '', name: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [deptMsg, setDeptMsg] = useState('');

  // Admin Change Password State
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Cloud Database Status
  const [dbHealth, setDbHealth] = useState(null);
  const [reconnectingDb, setReconnectingDb] = useState(false);
  const [dbMsg, setDbMsg] = useState('');
  const [dbErr, setDbErr] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const checkDb = async () => {
    try {
      const hRes = await api.get('/health');
      setDbHealth(hRes.data);
    } catch (e) {}
  };

  const fetchData = async () => {
    try {
      const [sRes, dRes] = await Promise.all([
        api.get('/settings'),
        api.get('/departments').catch(() => ({ data: [] }))
      ]);
      setSettings(sRes.data);
      setDepartments(dRes.data);
      await checkDb();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReconnectDb = async () => {
    setReconnectingDb(true);
    setDbMsg('');
    setDbErr('');
    try {
      const res = await api.post('/admin/reconnect-db');
      setDbMsg(res.data.message);
      await checkDb();
    } catch (err) {
      setDbErr(err.response?.data?.detail || 'Could not connect to MongoDB Atlas cluster. Check IP Access List.');
    } finally {
      setReconnectingDb(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const res = await api.patch('/settings', settings);
      setSettings(res.data);
      setMsg('Institutional policies updated successfully.');
    } catch (err) {
      alert('Failed to update institutional settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddDept = async (e) => {
    e.preventDefault();
    if (!newDept.code || !newDept.name) return;
    try {
      await api.post('/departments', newDept);
      setDeptMsg(`Department ${newDept.name} (${newDept.code.toUpperCase()}) created.`);
      setNewDept({ code: '', name: '' });
      const dRes = await api.get('/departments');
      setDepartments(dRes.data);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to add department.');
    }
  };

  const handleDeleteDept = async (deptId, code) => {
    if (!window.confirm(`Delete department ${code}?`)) return;
    try {
      await api.delete(`/departments/${deptId}`);
      setDeptMsg(`Department ${code} removed.`);
      setDepartments((prev) => prev.filter((d) => d._id !== deptId));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete department.');
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordErr('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordErr('New password and confirm password do not match.');
      return;
    }
    if (passwordData.new_password.length < 6) {
      setPasswordErr('New password must be at least 6 characters long.');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await api.post('/auth/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      setPasswordMsg(res.data.message || 'Administrator password updated successfully! Please use your new password on your next login.');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPasswordErr(err.response?.data?.detail || 'Failed to update administrator password. Please check your current password.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Institution & Academic Settings</h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure authoritative institutional clock, attendance deadline cutoffs, and academic branches.
        </p>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Card 0: Cloud Database Connection Status */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-xl ${dbHealth?.is_mock_database ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                MongoDB Atlas Cloud Database
              </h3>
              <p className="text-xs text-slate-500">
                Cluster: <span className="font-mono text-slate-700">Cluster0</span> • Database: <span className="font-mono font-bold text-slate-700">{dbHealth?.database_name || 'student_center_db'}</span>
              </p>
            </div>
          </div>

          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${
            dbHealth?.is_mock_database
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            {dbHealth?.is_mock_database ? '● In-Memory Fallback' : '● Live Atlas Connected'}
          </span>
        </div>

        {dbHealth?.is_mock_database ? (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 space-y-2 text-xs text-amber-900">
            <p className="font-semibold flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>MongoDB Atlas IP Access Authorization Required</span>
            </p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Your Atlas cluster is rejecting the connection (<span className="font-mono">TLS alert internal error</span>). To store student records and study materials permanently, log in to <strong>cloud.mongodb.com</strong>, navigate to <strong>Network Access</strong>, and add <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">0.0.0.0/0</code> (Allow Access from Anywhere).
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All student registrations, approvals, passwords, and study materials are actively stored directly in your permanent MongoDB Atlas cloud cluster.</span>
          </div>
        )}

        {dbMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{dbMsg}</span>
          </div>
        )}

        {dbErr && (
          <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{dbErr}</span>
          </div>
        )}

        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <p className="text-[11px] text-slate-500">
            Click to test connection and initialize baseline collections on MongoDB Atlas.
          </p>
          <button
            type="button"
            onClick={handleReconnectDb}
            disabled={reconnectingDb}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold shadow transition flex items-center space-x-1.5 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reconnectingDb ? 'animate-spin' : ''}`} />
            <span>{reconnectingDb ? 'Connecting...' : 'Test & Connect to MongoDB Atlas'}</span>
          </button>
        </div>
      </div>

      {/* Card 1: Core Institutional Parameters */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
          <Settings className="w-4 h-4 text-blue-600" />
          <span>General Policies & Attendance Cutoff</span>
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
            Institution Name
          </label>
          <input
            type="text"
            required
            value={settings.institutionName}
            onChange={(e) => setSettings({ ...settings, institutionName: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Timezone (Authoritative Server Clock)
            </label>
            <input
              type="text"
              required
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Default: Asia/Kolkata</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Daily Attendance Cutoff Time (24h format)
            </label>
            <input
              type="text"
              required
              placeholder="19:00"
              value={settings.attendanceCutoff}
              onChange={(e) => setSettings({ ...settings, attendanceCutoff: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-amber-700"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">19:00 corresponds to 7:00 PM IST</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Minimum Attendance Requirement (%)
            </label>
            <input
              type="number"
              required
              value={settings.minimumAttendancePercentage}
              onChange={(e) => setSettings({ ...settings, minimumAttendancePercentage: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Institutional exam threshold: 75%</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Max Study Material File Size (MB)
            </label>
            <input
              type="number"
              required
              value={settings.maxUploadSizeMB}
              onChange={(e) => setSettings({ ...settings, maxUploadSizeMB: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow transition flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Card 2: Branches & Departments Management */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-purple-600" />
            <span>Branches & Departments ({departments.length})</span>
          </h3>
          <span className="text-xs text-slate-500">e.g. CYBER, CSE, ECE, IT</span>
        </div>

        {deptMsg && (
          <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{deptMsg}</span>
          </div>
        )}

        {/* Existing Departments List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {departments.map((d) => (
            <div
              key={d._id || d.code}
              className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
            >
              <div>
                <span className="font-mono font-bold text-purple-700 text-xs bg-purple-100 px-2 py-0.5 rounded mr-2">
                  {d.code}
                </span>
                <span className="text-xs font-semibold text-slate-800">{d.name}</span>
              </div>
              <button
                onClick={() => handleDeleteDept(d._id, d.code)}
                className="text-slate-400 hover:text-red-600 p-1 rounded transition"
                title="Delete Branch"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Department Form */}
        <form onSubmit={handleAddDept} className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            required
            placeholder="Branch Code (e.g. CYBER)"
            value={newDept.code}
            onChange={(e) => setNewDept({ ...newDept, code: e.target.value.toUpperCase() })}
            className="w-full sm:w-1/3 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
          />
          <input
            type="text"
            required
            placeholder="Branch Name (e.g. Cybersecurity)"
            value={newDept.name}
            onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
            className="w-full sm:w-1/2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Branch</span>
          </button>
        </form>
      </div>

      {/* 3. Change Administrator Password & Account Security */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Administrator Password & Account Security</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Update your administrative login credentials to prevent unauthorized access using predictable default passwords.
          </p>
        </div>

        {passwordMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{passwordMsg}</span>
          </div>
        )}

        {passwordErr && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{passwordErr}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Current Administrator Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                name="current_password"
                placeholder="Enter current password (e.g. Admin@123)"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  name="new_password"
                  placeholder="At least 6 characters"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  name="confirm_password"
                  placeholder="Repeat new password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:bg-slate-400 text-white font-bold rounded-xl text-sm shadow-md shadow-purple-700/20 transition flex items-center space-x-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>{savingPassword ? 'Updating Password...' : 'Update Admin Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
