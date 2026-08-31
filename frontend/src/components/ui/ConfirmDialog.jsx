import React from 'react';
import Modal from './Modal';
import Button from './Button';
export default function ConfirmDialog({ open, title='Confirm action', message, onCancel, onConfirm, busy }) { return <Modal open={open} title={title} onClose={onCancel}><p className="ui-modal-copy">{message}</p><div className="ui-modal-actions"><Button variant="secondary" onClick={onCancel}>Cancel</Button><Button variant="danger" onClick={onConfirm} disabled={busy}>{busy?'Working…':'Confirm'}</Button></div></Modal>; }
