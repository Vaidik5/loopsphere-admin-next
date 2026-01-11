'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useUserStore } from '@/stores';

type Props = {
    open: boolean;
    onClose: () => void;
    userId: string | null;
};

export default function UserDeleteConfirm({ open, onClose, userId }: Props) {
    const [reason, setReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const deleteUser = useUserStore((s) => s.deleteUser);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!open) setReason('');
    }, [open]);

    const handleConfirm = async () => {
        if (!userId) return;
        setIsProcessing(true);
        try {
            const res = await deleteUser(userId, reason.trim());
            if (res?.success) {
                toast.success(res.message || 'User deleted');
                queryClient.invalidateQueries({ queryKey: ['user-users'] });
                onClose();
            } else {
                toast.error(res?.message || 'Failed to delete user');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Failed to delete user');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-center text-lg text-destructive">Delete Admin User?</DialogTitle>
                </DialogHeader>
                <DialogBody className="space-y-4">
                    <p className="text-center text-sm text-muted-foreground">
                        This action is irreversible. Are you sure you want to delete this admin user permanently?
                    </p>

                    <div>
                        <Textarea
                            placeholder="Reason for deletion"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                        />
                    </div>
                </DialogBody>
                <DialogFooter className="flex gap-3 justify-end">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
                        Cancel
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleConfirm} disabled={isProcessing || !reason.trim()}>
                        {isProcessing ? 'Deleting...' : 'Yes, Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
