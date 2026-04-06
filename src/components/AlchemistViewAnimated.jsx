import { MessageSquare } from 'lucide-react';
import { FLOATING_WHATSAPP_URL } from '../lib/constants';
import { getPublishedAlchemistRecipes } from '../lib/alchemistCuratedRecipes';
import AlchemistClosingSection from './alchemist/AlchemistClosingSection';
import AlchemistCuratedRecipesSection from './alchemist/AlchemistCuratedRecipesSection';
import AlchemistFlowSection from './alchemist/AlchemistFlowSection';
import AlchemistHeroSection from './alchemist/AlchemistHeroSection';
import AlchemistPantrySection from './alchemist/AlchemistPantrySection';
import AlchemistStudioSection from './alchemist/AlchemistStudioSection';

const AlchemistViewAnimated = ({
  isChefUnlocked,
  validateLogic,
  onUnlockSuccess,
  chefQuery,
  setChefQuery,
  askChef,
  chefLoading,
  chefResult,
  chefFallbackText,
  chefFallbackActionable,
  resetChef
}) => {
  const curatedRecipes = getPublishedAlchemistRecipes();

  return (
    <div className="min-h-screen bg-beige-100 text-stone-900 selection:bg-yolk-500 selection:text-brand-950 font-sans">
      <AlchemistHeroSection />
      <AlchemistFlowSection />
      <AlchemistPantrySection />
      <AlchemistStudioSection
        isChefUnlocked={isChefUnlocked}
        validateLogic={validateLogic}
        onUnlockSuccess={onUnlockSuccess}
        chefQuery={chefQuery}
        setChefQuery={setChefQuery}
        askChef={askChef}
        chefLoading={chefLoading}
        chefResult={chefResult}
        chefFallbackText={chefFallbackText}
        chefFallbackActionable={chefFallbackActionable}
        resetChef={resetChef}
      />
      <AlchemistCuratedRecipesSection recipes={curatedRecipes} />
      <AlchemistClosingSection />

      <a
        href={FLOATING_WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        className="fixed right-5 bottom-5 z-[70] group"
        aria-label="Pedir por WhatsApp"
      >
        <span className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl bg-brand-900 px-3 py-2 text-xs font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          Pedir por WhatsApp
        </span>
        <span className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#25D366] text-white shadow-2xl">
          <MessageSquare size={24} />
        </span>
      </a>
    </div>
  );
};

export default AlchemistViewAnimated;
