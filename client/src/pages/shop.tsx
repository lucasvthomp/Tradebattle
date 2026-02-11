import { Gift } from "lucide-react";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

export default function Shop() {
  const { t } = useUserPreferences();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#E3B34120' }}>
          <Gift className="w-10 h-10" style={{ color: '#E3B341' }} />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('rewards')}</h1>
        <p className="text-muted-foreground">{t('comingSoon')}</p>
      </div>
    </div>
  );
}
