import React, { useMemo } from 'react';
import { TransportRecord } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { TrendingUp, Scale, Users } from 'lucide-react';

interface DashboardProps {
  records: TransportRecord[];
  summary?: string;
}

const COLORS = ['#3e9250', '#62ad71', '#95cd9f', '#265c34', '#eab308', '#f59e0b', '#64748b'];

const Dashboard: React.FC<DashboardProps> = ({ records, summary }) => {
  const stats = useMemo(() => {
    const totalTons = records.reduce((acc, r) => acc + r.amountTons, 0);
    const totalTrips = records.length;
    const uniquePeople = new Set(records.map(r => r.person)).size;

    return { totalTons, totalTrips, uniquePeople };
  }, [records]);

  const personData = useMemo(() => {
    const map = new Map<string, number>();
    records.forEach(r => {
      const current = map.get(r.person) || 0;
      map.set(r.person, current + r.amountTons);
    });
    return Array.from(map.entries()).map(([name, tons]) => ({ name, tons }));
  }, [records]);

  const vehicleData = useMemo(() => {
    const map = new Map<string, number>();
    records.forEach(r => {
      const current = map.get(r.vehicle) || 0;
      map.set(r.vehicle, current + r.amountTons);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [records]);

  if (records.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 mt-6 transition-colors">
        <Scale className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">No data available</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Log some transport entries to see the analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Transported</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalTons.toFixed(1)} <span className="text-lg text-slate-400 dark:text-slate-500 font-normal">tons</span></p>
            </div>
            <div className="p-3 bg-agri-50 dark:bg-agri-900/20 rounded-lg">
              <Scale className="h-6 w-6 text-agri-600 dark:text-agri-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Trips</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalTrips}</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Drivers</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.uniquePeople}</p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <Users className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {summary && (
        <div className="bg-gradient-to-r from-agri-50 to-white dark:from-agri-900/30 dark:to-slate-800 p-4 rounded-xl border border-agri-100 dark:border-agri-900/50 text-agri-900 dark:text-agri-100 text-sm italic flex items-start gap-3 transition-colors">
           <div className="mt-1 p-1 bg-agri-200 dark:bg-agri-800 rounded-full"><TrendingUp size={14} className="text-agri-800 dark:text-agri-200"/></div>
           <div>
             <span className="font-semibold not-italic block mb-1 text-agri-800 dark:text-agri-200">AI Insight</span>
             {summary}
           </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Tons per Person */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Tons by Driver</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={personData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#94a3b8" strokeOpacity={0.3} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" fontSize={12} tick={{fill: '#94a3b8'}} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#fff' }}
                  itemStyle={{ color: '#333' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="tons" fill="#3e9250" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Vehicles */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Vehicle Utilization</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehicleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {vehicleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#fff' }}
                   itemStyle={{ color: '#333' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  formatter={(value) => <span className="text-slate-600 dark:text-slate-400 ml-1">{value}</span>} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;