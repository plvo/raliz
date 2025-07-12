'use client';

import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/alert';
import { Button } from '@repo/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card';
import { AlertTriangle, ExternalLink, RotateCcw } from 'lucide-react';
import React from 'react';

interface MetamaskPendingAlertProps {
  onRetry?: () => void;
}

export function MetamaskPendingAlert({ onRetry }: MetamaskPendingAlertProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md mx-auto border-orange-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <AlertTriangle className="h-5 w-5" />
            Metamask Request En Attente
          </CardTitle>
          <CardDescription>
            Une demande est déjà en cours dans votre extension Metamask
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-800">Action requise</AlertTitle>
            <AlertDescription className="text-orange-700">
              Veuillez vérifier votre extension Metamask et approuver ou rejeter la demande en attente.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="bg-muted p-3 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">🔧 Étapes à suivre :</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Cliquez sur l'icône Metamask dans votre navigateur</li>
                <li>Vérifiez s'il y a une notification avec un chiffre</li>
                <li>Approuvez ou rejetez la demande en attente</li>
                <li>Retournez à cette page et réessayez</li>
              </ol>
            </div>

            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <h4 className="font-semibold text-sm text-red-800">⚠️ Si le problème persiste :</h4>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                <li>Redémarrez votre navigateur</li>
                <li>Désactivez puis réactivez l'extension Metamask</li>
                <li>Effacez les données de site pour localhost:3001</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleRefresh} className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Actualiser la page
            </Button>
            
            {onRetry && (
              <Button variant="outline" onClick={onRetry} className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Réessayer la connexion
              </Button>
            )}
            
            <Button variant="outline" onClick={() => setIsVisible(false)}>
              Fermer cette alerte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 