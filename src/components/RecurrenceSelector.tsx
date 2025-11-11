import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RecurrencePattern } from '../types/Task';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { 
  X, 
  Repeat, 
  Calendar,
  ChevronRight,
  Check
} from 'lucide-react';
import { getRecurrenceDescription, getUpcomingOccurrences } from '../utils/recurringTasks';

interface RecurrenceSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pattern: RecurrencePattern | null) => void;
  initialPattern?: RecurrencePattern;
}

export function RecurrenceSelector({ 
  isOpen, 
  onClose, 
  onSelect, 
  initialPattern 
}: RecurrenceSelectorProps) {
  const [selectedType, setSelectedType] = useState<'none' | 'daily' | 'weekly' | 'monthly' | 'custom'>(
    initialPattern?.type || 'none'
  );
  const [interval, setInterval] = useState(initialPattern?.interval || 1);
  const [selectedDays, setSelectedDays] = useState<number[]>(initialPattern?.daysOfWeek || []);
  const [dayOfMonth, setDayOfMonth] = useState(initialPattern?.dayOfMonth || 1);

  const dayLabels = [
    { short: 'S', full: 'Sun', index: 0 },
    { short: 'M', full: 'Mon', index: 1 },
    { short: 'T', full: 'Tue', index: 2 },
    { short: 'W', full: 'Wed', index: 3 },
    { short: 'T', full: 'Thu', index: 4 },
    { short: 'F', full: 'Fri', index: 5 },
    { short: 'S', full: 'Sat', index: 6 },
  ];

  const toggleDay = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter(d => d !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex].sort((a, b) => a - b));
    }
  };

  const handleSave = () => {
    if (selectedType === 'none') {
      onSelect(null);
      onClose();
      return;
    }

    const pattern: RecurrencePattern = {
      type: selectedType as 'daily' | 'weekly' | 'monthly' | 'custom',
      interval,
    };

    if (selectedType === 'weekly' || selectedType === 'custom') {
      pattern.daysOfWeek = selectedDays.length > 0 ? selectedDays : [new Date().getDay()];
    }

    if (selectedType === 'monthly') {
      pattern.dayOfMonth = dayOfMonth;
    }

    onSelect(pattern);
    onClose();
  };

  const getPreviewText = () => {
    if (selectedType === 'none') return 'Does not repeat';

    const tempPattern: RecurrencePattern = {
      type: selectedType as 'daily' | 'weekly' | 'monthly' | 'custom',
      interval,
    };

    if (selectedType === 'weekly' || selectedType === 'custom') {
      tempPattern.daysOfWeek = selectedDays.length > 0 ? selectedDays : [new Date().getDay()];
    }

    if (selectedType === 'monthly') {
      tempPattern.dayOfMonth = dayOfMonth;
    }

    return getRecurrenceDescription(tempPattern);
  };

  // Get preview of upcoming dates
  const getPreviewDates = () => {
    if (selectedType === 'none') return [];

    const tempPattern: RecurrencePattern = {
      type: selectedType as 'daily' | 'weekly' | 'monthly' | 'custom',
      interval,
    };

    if (selectedType === 'weekly' || selectedType === 'custom') {
      tempPattern.daysOfWeek = selectedDays.length > 0 ? selectedDays : [new Date().getDay()];
    }

    if (selectedType === 'monthly') {
      tempPattern.dayOfMonth = dayOfMonth;
    }

    return getUpcomingOccurrences(tempPattern, 3);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 
                       md:bottom-4 md:w-[500px] md:rounded-3xl
                       bg-gradient-to-br from-blue-50 to-cyan-50
                       dark:from-slate-800 dark:to-slate-900
                       rounded-t-3xl md:rounded-3xl
                       shadow-2xl border-2 border-blue-200/50 dark:border-blue-700/50
                       backdrop-blur-xl
                       z-[111]
                       max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Wave decoration */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400" />

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-blue-200/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 
                                flex items-center justify-center">
                  <Repeat className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-medium text-blue-900 dark:text-blue-100">
                    Repeat Task
                  </h2>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {getPreviewText()}
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/80 dark:bg-slate-700/80 
                           backdrop-blur-sm border border-blue-200
                           flex items-center justify-center
                           hover:bg-white transition-all hover:scale-110 active:scale-95"
              >
                <X className="h-4 w-4 text-blue-700" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Recurrence Type Options */}
              <div className="space-y-3">
                <Label className="text-blue-900 dark:text-blue-100">Repeat Pattern</Label>
                
                <div className="grid gap-2">
                  {/* No Repeat */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType('none')}
                    className={`p-4 rounded-xl border-2 transition-all text-left
                      ${selectedType === 'none' 
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                        : 'border-blue-200/50 bg-white/60 dark:bg-slate-800/60 hover:border-blue-300'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-900 dark:text-blue-100">Does not repeat</span>
                      {selectedType === 'none' && <Check className="h-5 w-5 text-blue-600" />}
                    </div>
                  </motion.button>

                  {/* Daily */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType('daily')}
                    className={`p-4 rounded-xl border-2 transition-all text-left
                      ${selectedType === 'daily' 
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                        : 'border-blue-200/50 bg-white/60 dark:bg-slate-800/60 hover:border-blue-300'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-900 dark:text-blue-100">Daily</span>
                      {selectedType === 'daily' && <Check className="h-5 w-5 text-blue-600" />}
                    </div>
                  </motion.button>

                  {/* Weekly */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType('weekly')}
                    className={`p-4 rounded-xl border-2 transition-all text-left
                      ${selectedType === 'weekly' 
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                        : 'border-blue-200/50 bg-white/60 dark:bg-slate-800/60 hover:border-blue-300'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-blue-900 dark:text-blue-100">Weekly</div>
                        {selectedType === 'weekly' && selectedDays.length > 0 && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            {selectedDays.map(d => dayLabels[d].full).join(', ')}
                          </div>
                        )}
                      </div>
                      <ChevronRight className={`h-5 w-5 text-blue-600 transition-transform ${
                        selectedType === 'weekly' ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </motion.button>

                  {/* Weekly Day Selector */}
                  <AnimatePresence>
                    {selectedType === 'weekly' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 pt-2 pb-3">
                          <div className="flex gap-2 justify-between">
                            {dayLabels.map((day) => (
                              <motion.button
                                key={day.index}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => toggleDay(day.index)}
                                className={`w-10 h-10 rounded-full font-medium transition-all
                                  ${selectedDays.includes(day.index)
                                    ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg'
                                    : 'bg-white/60 dark:bg-slate-700/60 text-blue-700 dark:text-blue-300 border-2 border-blue-200'
                                  }`}
                              >
                                {day.short}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Monthly */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType('monthly')}
                    className={`p-4 rounded-xl border-2 transition-all text-left
                      ${selectedType === 'monthly' 
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                        : 'border-blue-200/50 bg-white/60 dark:bg-slate-800/60 hover:border-blue-300'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-blue-900 dark:text-blue-100">Monthly</div>
                        {selectedType === 'monthly' && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            On day {dayOfMonth}
                          </div>
                        )}
                      </div>
                      <ChevronRight className={`h-5 w-5 text-blue-600 transition-transform ${
                        selectedType === 'monthly' ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </motion.button>

                  {/* Monthly Day Selector */}
                  <AnimatePresence>
                    {selectedType === 'monthly' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 pt-2 pb-3">
                          <Label className="text-sm text-blue-700 dark:text-blue-300 mb-2 block">
                            Day of month
                          </Label>
                          <input
                            type="number"
                            min="1"
                            max="31"
                            value={dayOfMonth}
                            onChange={(e) => setDayOfMonth(Math.min(31, Math.max(1, parseInt(e.target.value) || 1)))}
                            className="w-full px-4 py-2 rounded-xl border-2 border-blue-200 
                                     bg-white/60 dark:bg-slate-800/60
                                     focus:border-blue-400 focus:outline-none
                                     text-blue-900 dark:text-blue-100"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Preview of upcoming dates */}
              {selectedType !== 'none' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 
                             dark:from-purple-900/20 dark:to-pink-900/20
                             border border-purple-200 dark:border-purple-700"
                >
                  <div className="flex items-start gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">
                        Next 3 occurrences
                      </h4>
                      <div className="space-y-1">
                        {getPreviewDates().map((date, index) => (
                          <div key={index} className="text-xs text-purple-700 dark:text-purple-300">
                            • {date.toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-blue-200/30 bg-blue-50/50 dark:bg-slate-800/50 space-y-3">
              <Button
                onClick={handleSave}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500 
                           hover:from-blue-600 hover:to-cyan-600
                           text-white font-medium rounded-xl shadow-lg
                           hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Check className="h-5 w-5 mr-2" />
                Save Recurrence
              </Button>
              
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full h-12 border-2 border-blue-300 text-blue-700 rounded-xl
                           hover:bg-blue-50 transition-all"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
