import { render, screen, fireEvent } from '@testing-library/react';
import { DateSelector } from './DateSelector';
import { format, addDays } from 'date-fns';
import { describe, it, expect } from 'vitest';

describe('DateSelector', () => {
  it('renders "Today" and next two days', () => {
    render(<DateSelector />);
    
    expect(screen.getByText('Today')).toBeInTheDocument();
    
    const tomorrow = addDays(new Date(), 1);
    const dayAfter = addDays(new Date(), 2);
    
    expect(screen.getByText(format(tomorrow, 'MM/dd'))).toBeInTheDocument();
    expect(screen.getByText(format(dayAfter, 'MM/dd'))).toBeInTheDocument();
  });

  it('allows selection of dates', () => {
    render(<DateSelector />);
    
    const todayButton = screen.getByText('Today').closest('button');
    const tomorrowDate = format(addDays(new Date(), 1), 'MM/dd');
    const tomorrowButton = screen.getByText(tomorrowDate).closest('button');

    // Initial state: Today is active (bg-[#bcc2c9])
    expect(todayButton).toHaveClass('bg-[#bcc2c9]');
    expect(tomorrowButton).toHaveClass('border');

    // Click tomorrow
    if (tomorrowButton) {
        fireEvent.click(tomorrowButton);
    }

    // New state: Tomorrow is active
    expect(tomorrowButton).toHaveClass('bg-[#bcc2c9]');
    expect(todayButton).toHaveClass('border');
  });
});
