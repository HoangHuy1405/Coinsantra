import { UserProfile } from '@/services/userService'
import { Button } from '../ui/shadcn/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/shadcn/card'
import { Input } from '../ui/shadcn/input'
import { Label } from '../ui/shadcn/label'

type ProfileCardProps = {
    profile: UserProfile,
    onSave?: (updatedProfile: UserProfile) => void
}


export default function ProfileCard({ profile, onSave }: ProfileCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>
                    Update your personal information
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="firstname">First name</Label>
                    <Input
                        id="firstname"
                        value={profile.firstName}
                        onChange={() => { }}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastname">Last name</Label>
                    <Input
                        id="lastname"
                        value={profile.lastName}
                        onChange={() => { }}
                    />
                </div>
                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={() => { }}
                    />
                </div>
                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                        id="role"
                        value={profile.roles.join(", ")}
                        disabled
                    />
                </div>
            </CardContent>
        </Card>
    )
}
