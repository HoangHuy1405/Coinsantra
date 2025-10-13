import Image from "next/image";

type UserAvatarProps = {
  avatarUrl?: string | null;
  fullname?: string | null;
  username: string;
  size?: number; // default 32 (w-8 h-8)
};

export default function UserAvatar({
  avatarUrl,
  fullname,
  username,
  size = 32,
}: UserAvatarProps) {
  const fallback = `https://ui-avatars.com/api/?name=${fullname || username}&background=random`;
  return (
    <Image
      src={avatarUrl ?? fallback}
      alt="avatar"
      width={size}
      height={size}
      className="rounded-full object-cover"
      unoptimized
    />
  );
}
