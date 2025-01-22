import { useNavigate } from 'react-router-dom';

export default function WelcomeChatScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-end h-full pb-20">
      <div className="text-center space-y-2 text-muted-foreground/60">
        <h1 className="text-2xl font-normal">Welcome to your new workspace.</h1>
        <p className="text-lg">
          To get started either{' '}
          <button
            onClick={() => navigate('/knowledge')}
            className="text-primary/70 hover:text-primary/90 underline-offset-4 hover:underline transition-colors"
          >
            upload a document
          </button>
          {' '}or{' '}
          <span className="italic">send a chat</span>.
        </p>
      </div>
    </div>
  );
}
