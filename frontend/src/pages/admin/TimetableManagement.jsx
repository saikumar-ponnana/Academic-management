import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Plus, Clock, MapPin, Trash2, CheckCircle2, AlertTriangle, Filter, BookOpen } from 'lucide-react';

const TimetableManagement = () => {
  const [timetable, setTimetable] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');

  const [form, setForm] = useState({
    academic_year: '2026-2027',
    semester: 3,
    department_code: 'CYBER',
    section: 'A',
    course_id: '',
    faculty_user_id: '',
    day_of_week: 'Monday',
    start_time: '10:00',
    end_time: '11:00',
    duration_mins: 60,
    location: 'Cybersecurity Lab 1'
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    try {
      const [tRes, cRes, fRes, dRes] = await Promise.all([
        api.get('/timetable'),
        api.get('/courses'),
        api.get('/admin/faculty'),
        api.get('/departments').catch(() => ({
          data: [
            { code: 'CYBER', name: 'Cybersecurity' },
            { code: 'CSE', name: 'Computer Science & Engineering' },
            { code: 'ECE', name: 'Electronics & Communication Engineering' },
            { code: 'IT', name: 'Information Technology' }
          ]
        }))
      ]);
      setTimetable(tRes.data);
      setCourses(cRes.data);
      setFaculty(fRes.data);
      setDepartments(dRes.data.length > 0 ? dRes.data : [
        { code: 'CYBER', name: 'CSE (Cyber Security)' }
      ]);

      if (cRes.data.length > 0) {
        setForm((p) => ({
          ...p,
          course_id: cRes.data[0]._id,
          department_code: cRes.data[0].department_code || 'CYBER'
        }));
      }
      if (fRes.data.length > 0) {
        setForm((p) => ({ ...p, faculty_user_id: fRes.data[0].user_id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTimeOrDurationChange = (newStart, newDuration) => {
    const duration = parseInt(newDuration) || 60;
    try {
      const [h, m] = newStart.split(':').map(Number);
      const startMinutes = h * 60 + m;
      const endMinutes = startMinutes + duration;
      const endH = Math.floor(endMinutes / 60) % 24;
      const endM = endMinutes % 60;
      const computedEnd = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
      setForm((p) => ({
        ...p,
        start_time: newStart,
        duration_mins: duration,
        end_time: computedEnd
      }));
    } catch {
      setForm((p) => ({ ...p, start_time: newStart, duration_mins: duration }));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.course_id) {
      setError('Please create at least one subject in Course Management before adding a timetable session.');
      return;
    }
    if (!form.faculty_user_id) {
      setError('Please select an assigned faculty teacher.');
      return;
    }
    try {
      await api.post('/timetable', form);
      setMsg('Timetable session mapped and scheduled successfully.');
      setModalOpen(false);
      const tRes = await api.get('/timetable');
      setTimetable(tRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Schedule conflict detected.');
    }
  };

  const handleDelete = async (id, courseName, day, time) => {
    if (!window.confirm(`Delete ${courseName} session on ${day} (${time})?`)) return;
    try {
      await api.delete(`/timetable/${id}`);
      setTimetable((prev) => prev.filter((t) => t._id !== id));
      setMsg('Timetable entry removed.');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete entry.');
    }
  };

  const filteredTimetable = selectedDeptFilter
    ? timetable.filter((t) => t.department_code === selectedDeptFilter)
    : timetable;

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Academic Timetable & Class Schedule</h2>
          <p className="text-xs text-slate-500 mt-1">
            Map subjects to faculty, configure class duration and timings, and eliminate schedule conflicts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Department Filter */}
          <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent outline-hidden"
            >
              <option value="">All Branches</option>
              {departments.map((d) => (
                <option key={d.code} value={d.code}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setError('');
              if (courses.length === 0) {
                alert('Please first add subjects in the "Course Management" tab before scheduling a timetable.');
                return;
              }
              setModalOpen(true);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Map Class / Add Session</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {courses.length === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>No subjects exist yet in the database. Add your Cybersecurity subjects first in <strong>Course Catalog</strong> so they can be mapped to timetable sessions.</span>
          </div>
        </div>
      )}

      {/* Timetable Weekly Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days.map((day) => {
          const sessions = filteredTimetable.filter((t) => t.day_of_week === day);

          return (
            <div key={day} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
              <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
                <span className="font-bold text-sm tracking-wide">{day}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {sessions.length} sessions
                </span>
              </div>

              <div className="p-4 flex-1 space-y-3">
                {sessions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center">No sessions scheduled</p>
                ) : (
                  sessions.map((s) => (
                    <div
                      key={s._id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5 relative group hover:border-blue-300 transition"
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-xs text-slate-800">{s.course_name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">
                          {s.course_code}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-[11px] text-slate-600 font-mono">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>{s.start_time} - {s.end_time}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                          {s.department_code}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span className="font-medium text-purple-700">{s.faculty_name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-slate-700">Sec {s.section} • {s.location}</span>
                          <button
                            onClick={() => handleDelete(s._id, s.course_name, s.day_of_week, `${s.start_time}-${s.end_time}`)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"
                            title="Delete Session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Map Class / Add Session */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Map Class / Timetable Session</span>
            </h3>

            {error && (
              <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                {/* Subject / Course */}
                <div className="col-span-2">
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Subject / Course *</label>
                  <select
                    required
                    value={form.course_id}
                    onChange={(e) => {
                      const sel = courses.find((c) => c._id === e.target.value);
                      setForm({
                        ...form,
                        course_id: e.target.value,
                        department_code: sel?.department_code || form.department_code,
                        semester: sel?.semester || form.semester
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        [{c.code}] {c.name} ({c.department_code} - Sem {c.semester})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Faculty Teacher */}
                <div className="col-span-2">
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Faculty Teacher *</label>
                  <select
                    required
                    value={form.faculty_user_id}
                    onChange={(e) => setForm({ ...form, faculty_user_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {faculty.map((f) => (
                      <option key={f.user_id} value={f.user_id}>
                        {f.full_name} ({f.faculty_id} - {f.department_code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Branch / Dept */}
                <div>
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Branch / Dept *</label>
                  <select
                    value={form.department_code}
                    onChange={(e) => setForm({ ...form, department_code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {departments.map((d) => (
                      <option key={d.code} value={d.code}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                {/* Section */}
                <div>
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Section *</label>
                  <select
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>

                {/* Day of Week */}
                <div>
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Day of Week *</label>
                  <select
                    value={form.day_of_week}
                    onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Classroom Location */}
                <div>
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Classroom / Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cyber Lab 1 or Room 301"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Start Time (HH:MM) *</label>
                  <input
                    type="time"
                    required
                    value={form.start_time}
                    onChange={(e) => handleStartTimeOrDurationChange(e.target.value, form.duration_mins)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Class Duration</label>
                  <select
                    value={form.duration_mins}
                    onChange={(e) => handleStartTimeOrDurationChange(form.start_time, e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  >
                    <option value="50">50 Minutes</option>
                    <option value="60">1 Hour (60m)</option>
                    <option value="90">1.5 Hours (90m)</option>
                    <option value="120">2 Hours (120m)</option>
                    <option value="180">3 Hours (Lab)</option>
                  </select>
                </div>

                {/* End Time (Calculated) */}
                <div className="col-span-2">
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Computed End Time (HH:MM) *</label>
                  <input
                    type="time"
                    required
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Calculated automatically from Start Time + Duration, or adjust manually.</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                >
                  Confirm & Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableManagement;
