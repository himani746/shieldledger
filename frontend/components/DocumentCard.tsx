import Link from 'next/link';
import { Card, CardBody, CardFooter } from './Card';
import { Badge } from './Badge';

interface DocumentCardProps {
  id: string;
  name: string;
  hash: string;
  timestamp: string;
  verified: boolean;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  id,
  name,
  hash,
  timestamp,
  verified,
}) => {
  return (
    <Link href={`/documents/${id}`}>
      <Card className="hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer h-full">
        <CardBody>
          <div className="mb-3">
            <h3 className="font-bold text-foreground truncate">{name}</h3>
          </div>
          <div className="space-y-2 mb-4">
            <p className="text-xs text-muted-foreground break-all">
              Hash: {hash.substring(0, 32)}...
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(timestamp).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            {verified && (
              <Badge variant="success">✓ Verified</Badge>
            )}
            {!verified && (
              <Badge variant="warning">Pending</Badge>
            )}
          </div>
        </CardBody>
      </Card>
    </Link>
  );
};
