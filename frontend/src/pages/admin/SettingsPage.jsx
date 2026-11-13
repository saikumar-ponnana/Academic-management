import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Settings, Save, CheckCircle2, Clock, Globe, Building2, Plus, Trash2 } from 'lucide-react';

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sRes, dRes] = await Promise.all([
        api.get('/settings'),
        api.get('/departments').catch(() => ({ data: [] }))
      ]);
      setSettings(sRes.data);
      setDepartments(dRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
    </div>
  );
};

export default SettingsPage;
