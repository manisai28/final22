import React, { useEffect, useRef } from 'react';
import * as Chart from 'chart.js';
import { TrendingUp, Eye, Heart, Share2, BarChart3 } from 'lucide-react';

const Analytics = ({
  totalViews = 10,
  totalLikes = 5,
  totalShares = 2,
  engagementRate = 0,
  viewsData = [
    { date: '2025-05-24', views: 2 },
    { date: '2025-05-25', views: 2 },
    { date: '2025-05-26', views: 3 },
    { date: '2025-05-27', views: 0 },
    { date: '2025-05-28', views: 5 },
    { date: '2025-05-29', views: 6 },
    { date: '2025-05-30', views: 10 },
  ]
} = {}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current && viewsData.length > 0) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');

      Chart.Chart.register(...Chart.registerables);

      chartInstance.current = new Chart.Chart(ctx, {
        type: 'line',
        data: {
          labels: viewsData.map(item => item.date),
          datasets: [{
            label: 'Views',
            data: viewsData.map(item => item.views),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: '#111827',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: '#4b5563',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: false,
              callbacks: {
                label: function (context) {
                  return `Views: ${context.parsed.y.toLocaleString()}`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                color: '#374151'
              },
              ticks: {
                color: '#d1d5db',
                font: {
                  size: 12
                }
              }
            },
            y: {
              grid: {
                color: '#374151',
                drawBorder: false
              },
              ticks: {
                color: '#d1d5db',
                font: {
                  size: 12
                },
                callback: function (value) {
                  return value >= 1000 ? (value / 1000).toFixed(0) + 'K' : value;
                }
              }
            }
          },
          interaction: {
            intersect: false,
            mode: 'index'
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [viewsData]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const MetricCard = ({ icon: Icon, title, value, color = 'text-blue-400' }) => (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6 overflow-y-auto max-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            Video Analytics
          </h1>
          <p className="text-gray-400 mt-2">Monitor your video performance metrics</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard icon={Eye} title="Total Views" value={formatNumber(totalViews)} color="text-blue-400" />
          <MetricCard icon={Heart} title="Total Likes" value={formatNumber(totalLikes)} color="text-red-400" />
          <MetricCard icon={Share2} title="Total Shares" value={formatNumber(totalShares)} color="text-green-400" />
          <MetricCard icon={TrendingUp} title="Engagement Rate" value={`${engagementRate.toFixed(1)}%`} color="text-purple-400" />
        </div>

        {/* Chart Section */}
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Daily Views</h2>
            <span className="text-sm text-gray-400">Last 7 days</span>
          </div>

          {viewsData.length > 0 ? (
            <div className="relative h-80">
              <canvas ref={chartRef} className="w-full h-full"></canvas>
            </div>
          ) : (
            <div className="flex items-center justify-center h-80 text-gray-400">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p>No data available</p>
                <p className="text-sm mt-1">Views data will appear here when available</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Data updates in real-time • Last updated: {new Date().toLocaleTimeString()}</p>
        </div>

        {/* Trending Topics Section */}
<div className="mt-12">
  <h2 className="text-2xl font-bold text-white mb-6">🔥 Trending Topics & Suggestions</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[
      "🎬 How to grow on YouTube with Shorts in 2025",
      "🧠 Top 5 AI Tools Every Creator Must Know",
      "📱 iPhone 17 Leaks & Reactions – Should You Upgrade?",
      "💻 Coding in Public: Build and Launch a Website in 24h",
      "🎨 Design Your Dream Room with AI | RoomGPT Demo",
      "🌱 Beginner Guide to Passive Income Online",
      "🎤 New Podcast Episode: Tech, Trends & Tea ☕"
    ].map((topic, index) => (
      <div
        key={index}
        className="bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow duration-300 hover:border-blue-500 cursor-pointer"
      >
        <p className="text-lg text-gray-100 font-medium">{topic}</p>
      </div>
    ))}
  </div>
</div>


      </div>
    </div>
  );
};

export default Analytics;
