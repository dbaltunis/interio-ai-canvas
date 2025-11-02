import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { formatJobNumber } from "@/lib/format-job-number";
import { format } from "date-fns";

interface DuplicateJobsSectionProps {
  parent: any | null;
  children: any[];
  siblings: any[];
  onJobClick: (jobId: string) => void;
}

export const DuplicateJobsSection = ({ 
  parent, 
  children, 
  siblings,
  onJobClick 
}: DuplicateJobsSectionProps) => {
  if (!parent && children.length === 0 && siblings.length === 0) return null;

  return (
    <Card className="border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Copy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <CardTitle className="text-base">Duplicate Jobs</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Parent Job */}
        {parent && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Original Job</p>
            <div 
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => onJobClick(parent.id)}
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{formatJobNumber(parent.job_number)}</p>
                  <Badge variant="outline" className="text-xs">Original</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{parent.name}</p>
                {parent.clients && (
                  <p className="text-xs text-muted-foreground">{parent.clients.name}</p>
                )}
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        )}

        {/* Sibling Jobs */}
        {siblings.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Other Duplicates ({siblings.length})
            </p>
            <div className="space-y-2">
              {siblings.map((sibling) => (
                <div
                  key={sibling.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => onJobClick(sibling.id)}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{formatJobNumber(sibling.job_number)}</p>
                      <Badge variant="secondary" className="text-xs">
                        <Copy className="h-3 w-3 mr-1" />
                        Duplicate
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{sibling.name}</p>
                    {sibling.clients && (
                      <p className="text-xs text-muted-foreground">{sibling.clients.name}</p>
                    )}
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Child Jobs (duplicates of current job) */}
        {children.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Duplicates of This Job ({children.length})
            </p>
            <div className="space-y-2">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => onJobClick(child.id)}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{formatJobNumber(child.job_number)}</p>
                      <Badge variant="secondary" className="text-xs">
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{child.name}</p>
                    {child.clients && (
                      <p className="text-xs text-muted-foreground">{child.clients.name}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Created {format(new Date(child.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
