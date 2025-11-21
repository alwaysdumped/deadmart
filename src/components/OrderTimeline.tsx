import React from 'react';
import { Check, Circle, Package, Truck, Home } from 'lucide-react';

interface TimelineItem {
    status: string;
    timestamp: string;
    note?: string;
}

interface OrderTimelineProps {
    timeline: TimelineItem[];
    currentStatus: string;
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ timeline, currentStatus }) => {
    const statusOrder = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    const getStatusIcon = (status: string, index: number) => {
        const isComplete = index <= currentIndex;
        const isCurrent = index === currentIndex;

        const iconClass = `h-8 w-8 ${isComplete ? 'text-white' : 'text-gray-400'
            }`;

        switch (status) {
            case 'pending':
                return <Circle className={iconClass} />;
            case 'confirmed':
                return <Check className={iconClass} />;
            case 'processing':
                return <Package className={iconClass} />;
            case 'out_for_delivery':
                return <Truck className={iconClass} />;
            case 'delivered':
                return <Home className={iconClass} />;
            default:
                return <Circle className={iconClass} />;
        }
    };

    const getStatusLabel = (status: string) => {
        return status
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const timelineData = statusOrder.map((status, index) => {
        const item = timeline.find(t => t.status === status);
        return {
            status,
            timestamp: item?.timestamp,
            note: item?.note,
            isComplete: index <= currentIndex,
            isCurrent: index === currentIndex,
        };
    });

    return (
        <div className="card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Order Timeline</h3>

            <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

                {/* Timeline Items */}
                <div className="space-y-8">
                    {timelineData.map((item, index) => (
                        <div key={item.status} className="relative flex items-start">
                            {/* Icon */}
                            <div
                                className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${item.isComplete
                                        ? 'bg-primary-600'
                                        : 'bg-gray-200'
                                    } transition-colors duration-300`}
                            >
                                {getStatusIcon(item.status, index)}
                            </div>

                            {/* Content */}
                            <div className="ml-6 flex-1">
                                <div className="flex items-center justify-between">
                                    <h4
                                        className={`text-base font-semibold ${item.isComplete ? 'text-gray-900' : 'text-gray-400'
                                            }`}
                                    >
                                        {getStatusLabel(item.status)}
                                    </h4>
                                    {item.timestamp && (
                                        <span className="text-sm text-gray-500">
                                            {new Date(item.timestamp).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                {item.note && (
                                    <p className="mt-1 text-sm text-gray-600">{item.note}</p>
                                )}
                                {item.isCurrent && !item.timestamp && (
                                    <p className="mt-1 text-sm text-primary-600 font-medium">
                                        Current Status
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Estimated Delivery */}
            {currentStatus !== 'delivered' && currentStatus !== 'cancelled' && (
                <div className="mt-8 p-4 bg-primary-50 rounded-lg border border-primary-200">
                    <p className="text-sm font-medium text-primary-900">
                        Estimated Delivery: {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
            )}
        </div>
    );
};

export default OrderTimeline;
