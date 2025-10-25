// app/signin/page.tsx
import SignIn from '@/components/Sign/SignIn'

interface SignInPageProps {
  searchParams: {
    callbackUrl?: string
    message?: string
  }
}

export default function SignInPage({ searchParams }: SignInPageProps) {
  const callbackUrl = searchParams.callbackUrl || '/dashboard'
  const message = searchParams.message || ''
  
  return <SignIn callbackUrl={callbackUrl} initialMessage={message} />
}