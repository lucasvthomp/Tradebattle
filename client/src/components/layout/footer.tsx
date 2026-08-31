import { Link } from "wouter";
import { FaInstagram, FaFacebook, FaTwitter, FaTiktok } from "react-icons/fa";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useAuth } from "@/hooks/use-auth";

export default function Footer() {
  const { t } = useUserPreferences();
  const { user } = useAuth();
  const isPublicSite = !user;
  return (
    <footer className="bg-card border-t border-border py-12" style={isPublicSite ? { background: '#07111f', borderColor: 'rgba(98, 228, 189, 0.12)' } : undefined}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: isPublicSite ? 'linear-gradient(135deg, #9af1d1, #42c99f)' : 'linear-gradient(135deg, #00A3FF, #0077CC)', boxShadow: isPublicSite ? '0 0 16px rgba(98, 228, 189, 0.16)' : '0 0 12px rgba(0, 163, 255, 0.12)' }}>
                  <span className="font-black text-sm" style={{ color: isPublicSite ? '#06151c' : undefined }}>{isPublicSite ? 'T' : 'O'}</span>
                </div>
                  <span className="text-xl font-display font-bold tracking-tight" style={isPublicSite ? { color: '#F2FBF8' } : undefined}>{isPublicSite ? 'TRADEBATTLE' : t('brandName')}</span>
              </div>
              <p className="text-muted-foreground text-sm">
                {t('tagline')}
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-foreground">Platform</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href={isPublicSite ? "/#how-it-works" : "/hub"} className="hover:text-foreground transition-colors">
                    {isPublicSite ? 'How it works' : t('hub')}
                  </Link>
                </li>
                <li>
                  <Link href={isPublicSite ? "/#modes" : "/tournaments"} className="hover:text-foreground transition-colors">
                    {isPublicSite ? 'Game modes' : t('tournaments')}
                  </Link>
                </li>
                <li>
                  <Link href={isPublicSite ? "/signup" : "/leaderboard"} className="hover:text-foreground transition-colors">
                    {isPublicSite ? 'Start competing' : t('leaderboard')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-foreground">{t('community')}</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href={isPublicSite ? "/about" : "/people"} className="hover:text-foreground transition-colors">
                    {isPublicSite ? 'About Tradebattle' : t('people')}
                  </Link>
                </li>
                <li>
                  <Link href={isPublicSite ? "/contact" : "/shop"} className="hover:text-foreground transition-colors">
                    {isPublicSite ? 'Support' : 'Shop'}
                  </Link>
                </li>
                <li>
                  <Link href={isPublicSite ? "/signup" : "/analytics"} className="hover:text-foreground transition-colors">
                    {isPublicSite ? 'Create an account' : t('analytics')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-foreground">{t('support')}</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href={isPublicSite ? "/privacy" : "/archive"} className="hover:text-foreground transition-colors">
                    {isPublicSite ? 'Privacy Policy' : 'Transaction Archive'}
                  </Link>
                </li>
                <li>
                  <Link href={isPublicSite ? "/login" : "/pricing"} className="hover:text-white transition-colors">
                    {isPublicSite ? 'Log in' : 'Pricing'}
                  </Link>
                </li>
                <li>
                  <Link href={isPublicSite ? "/signup" : "/withdraw"} className="hover:text-foreground transition-colors">
                    {isPublicSite ? 'Sign up' : 'Withdraw Funds'}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8" style={{ borderTop: '1px solid #0E2040' }}>
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-sm" style={{ color: '#8A93A6' }}>
                © 2026 ORSATH Holdings, LLC. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <div className="flex items-center space-x-4 mr-6">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                    style={{ color: '#8A93A6' }}
                    aria-label="Instagram"
                  >
                    <FaInstagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                    style={{ color: '#8A93A6' }}
                    aria-label="Facebook"
                  >
                    <FaFacebook className="w-5 h-5" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                    style={{ color: '#8A93A6' }}
                    aria-label="Twitter"
                  >
                    <FaTwitter className="w-5 h-5" />
                  </a>
                  <a
                    href="https://tiktok.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                    style={{ color: '#8A93A6' }}
                    aria-label="TikTok"
                  >
                    <FaTiktok className="w-5 h-5" />
                  </a>
                </div>
                <Link href="/privacy" className="hover:text-foreground transition-colors" style={{ color: '#8A93A6' }}>
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-foreground transition-colors" style={{ color: '#8A93A6' }}>
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
