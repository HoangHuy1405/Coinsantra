import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/shadcn/card'
import { Badge } from '../ui/shadcn/badge'
import { Separator } from '../ui/shadcn/separator'
import { Label } from '../ui/shadcn/label'
import { Button } from '../ui/shadcn/button'
import { Trash2 } from "lucide-react";

export default function AccountCard() {
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account preferences and subscription.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label className="text-base">Account Status</Label>
                            <p className="text-muted-foreground text-sm">Your account is currently active</p>
                        </div>
                        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                            Active
                        </Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label className="text-base">Subscription Plan</Label>
                            <p className="text-muted-foreground text-sm">Pro Plan - $29/month</p>
                        </div>
                        <Button variant="outline">Manage Subscription</Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Irreversible and destructive actions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label className="text-base">Delete Account</Label>
                            <p className="text-muted-foreground text-sm">
                                Permanently delete your account and all data
                            </p>
                        </div>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Account
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
