import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmModal from '../components/ConfirmModal';

describe('Modal Component UI Tests', () => {
  test('1. ConfirmModal does not render when isOpen is false', () => {
    render(
      <ConfirmModal
        isOpen={false}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
  });

  test('2. ConfirmModal renders with title and message when isOpen is true', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Delete Virtual Event"
        message="Are you sure you want to permanently delete this event?"
        confirmText="Confirm Delete"
        cancelText="Dismiss"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(screen.getByText('Delete Virtual Event')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to permanently delete this event?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  test('3. Clicking Confirm invokes onConfirm callback', () => {
    const handleConfirm = jest.fn();
    const handleCancel = jest.fn();

    render(
      <ConfirmModal
        isOpen={true}
        title="Delete Virtual Event"
        confirmText="Confirm Delete"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Confirm Delete' }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleCancel).not.toHaveBeenCalled();
  });

  test('4. Clicking Cancel invokes onCancel callback', () => {
    const handleConfirm = jest.fn();
    const handleCancel = jest.fn();

    render(
      <ConfirmModal
        isOpen={true}
        title="Delete Virtual Event"
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(handleCancel).toHaveBeenCalledTimes(1);
    expect(handleConfirm).not.toHaveBeenCalled();
  });
});
