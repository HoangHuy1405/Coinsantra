import { FcGoogle } from "react-icons/fc"
import { FaGithub } from "react-icons/fa"
import { Button } from "../shadcn/button"


export function GoogleButton({ onClick }: { onClick: () => void }) {
    return (
        <Button
            variant="outline"
            onClick={onClick}
            className="bg-transparent text-inherit hover:bg-transparent hover:border-primary"
        >
            <FcGoogle className="h-5 w-5" />
            Google
        </Button>
    )
}

export function GithubButton({ onClick }: { onClick: () => void }) {
    return (
        <Button
            variant="outline"
            onClick={onClick}
            className="bg-transparent text-inherit hover:bg-transparent hover:border-primary"
        >
            <FaGithub className="h-5 w-5" />
            GitHub
        </Button>
    )
}
