import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Clock, MapPin, BookOpen } from 'lucide-react';

const FacultyTimetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    api.get('/faculty/timetable')
      .then((res) => setTimetable(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">My Teaching Timetable</h2>
        <p className="text-xs text-slate-500 mt-1">
          Weekly schedule and class room allocations approved by Academic Administration.
        </p>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days.map((day) => {
          const dayClasses = timetable.filter((t) => t.day_of_week === day);

          return (
            <div key={day} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
              <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
                <span className="font-bold text-sm tracking-wide">{day}</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {dayClasses.length} {dayClasses.length === 1 ? 'class' : 'classes'}
                </span>
              </div>

              <div className="p-4 flex-1 space-y-3">
                {dayClasses.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center">No classes scheduled</p>
                ) : (
                  dayClasses.map((item) => (
                    <div
                      key={item._id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-xs transition space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-slate-800 text-xs">{item.course_name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">
                          {item.course_code}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>{item.start_time} - {item.end_time}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.location}</span>
                        </div>
                        <span className="font-semibold text-slate-700">Sec {item.section}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FacultyTimetable;

