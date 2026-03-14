import { useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChefHat,
  Clock3,
  Download,
  Heart,
  Printer,
  Share2,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  buildRecipeSummary,
  getRecipeDisplayTitle,
  getRecipeSecondaryTitle,
  translateAmount,
  translateCategory,
  translateDifficulty,
  translateDietaryLabel,
  translateIngredientName,
  translateInstruction,
  translateTip,
} from '../utils/recipeTranslations';
import { useRecipes } from '../hooks/useRecipes';
import './RecipeDetail.css';

const KHMER_DIGITS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];

function toKhmerNumber(value) {
  return String(value).replace(/\d/g, (digit) => KHMER_DIGITS[Number(digit)]);
}

function formatDisplayNumber(value) {
  if (!Number.isFinite(value)) {
    return String(value);
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
}

function parseLeadingAmount(token) {
  if (token.includes('/')) {
    const [numerator, denominator] = token.split('/').map(Number);
    if (!Number.isNaN(numerator) && !Number.isNaN(denominator) && denominator !== 0) {
      return numerator / denominator;
    }
    return Number.NaN;
  }

  return Number(token);
}

function formatScaledAmount(amount, multiplier) {
  if (!amount) {
    return '';
  }

  if (amount.toLowerCase() === 'amount varies') {
    return translateAmount(amount);
  }

  const match = amount.trim().match(/^(\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?)(.*)$/);
  if (!match) {
    return multiplier === 1 ? translateAmount(amount) : `${translateAmount(amount)} (x${multiplier})`;
  }

  const baseValue = parseLeadingAmount(match[1]);
  if (Number.isNaN(baseValue)) {
    return multiplier === 1 ? translateAmount(amount) : `${translateAmount(amount)} (x${multiplier})`;
  }

  const scaledValue = baseValue * multiplier;
  const formattedValue = Number.isInteger(scaledValue)
    ? String(scaledValue)
    : scaledValue.toFixed(scaledValue < 10 ? 1 : 0);

  return translateAmount(`${formattedValue}${match[2]}`);
}

function formatDurationLabel(totalMinutes) {
  return `${toKhmerNumber(totalMinutes)} នាទី`;
}

function formatStepDuration(seconds) {
  if (!seconds) {
    return 'ចម្អិនតាមសភាពម្ហូប';
  }

  const minutes = Math.ceil(seconds / 60);
  return `${toKhmerNumber(minutes)} នាទី`;
}

function getFallbackStepCopy() {
  return 'ធ្វើតាមជំហាននេះយ៉ាងម៉ត់ចត់ ដើម្បីឲ្យរសជាតិ និងសភាពម្ហូបបានល្អបំផុត។';
}

async function waitForEmbeddedImages(root) {
  if (!root) {
    return;
  }

  const images = Array.from(root.querySelectorAll('img'));

  await Promise.all(images.map(async (image) => {
    if (image.complete && image.naturalWidth > 0) {
      return;
    }

    if (typeof image.decode === 'function') {
      try {
        await image.decode();
        return;
      } catch {
        // Fall back to load/error listeners when decode is not available.
      }
    }

    await new Promise((resolve) => {
      const handleDone = () => resolve();
      image.addEventListener('load', handleDone, { once: true });
      image.addEventListener('error', handleDone, { once: true });
    });
  }));
}

export default function RecipeDetail() {
  const { id } = useParams();
  const { recipes, loading } = useRecipes();
  const recipe = recipes.find((item) => item.id === id);
  const exportRef = useRef(null);
  const statusTimeoutRef = useRef(null);
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [servingsMultiplier, setServingsMultiplier] = useState(1);
  const [isSaved, setIsSaved] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const relatedRecipes = useMemo(() => {
    if (!recipe) {
      return [];
    }

    const sameCategory = recipes.filter((item) => item.id !== recipe.id && item.category === recipe.category);
    const fallbackRecipes = recipes.filter((item) => item.id !== recipe.id && item.category !== recipe.category);

    return [...sameCategory, ...fallbackRecipes].slice(0, 3);
  }, [recipe, recipes]);

  if (loading && !recipe) {
    return <div className="container">កំពុងទាញយករូបមន្តម្ហូប...</div>;
  }

  if (!recipe) {
    return <div className="container">រកមិនឃើញរូបមន្តម្ហូប</div>;
  }

  const showStatusMessage = (message) => {
    setStatusMessage(message);

    if (statusTimeoutRef.current) {
      window.clearTimeout(statusTimeoutRef.current);
    }

    statusTimeoutRef.current = window.setTimeout(() => {
      setStatusMessage('');
    }, 2400);
  };

  const heroImage = `url("${encodeURI(recipe.image)}")`;
  const exportImageSrc = encodeURI(recipe.image);
  const recipeTitle = getRecipeDisplayTitle(recipe);
  const recipeSubtitle = getRecipeSecondaryTitle(recipe);
  const exportTitle = recipeSubtitle ? `${recipeTitle} (${recipeSubtitle})` : recipeTitle;
  const summary = buildRecipeSummary(recipe);
  const checkedCount = checkedIngredients.length;
  const totalTime = recipe.prepTime + recipe.cookTime;
  const servingsCount = recipe.servings * servingsMultiplier;
  const displayServings = toKhmerNumber(formatDisplayNumber(servingsCount));
  const translatedSteps = recipe.steps.map((step) => ({
    ...step,
    translatedInstruction: translateInstruction(step.instruction),
    translatedTip: translateTip(step.tip),
  }));
  const chefNote = translatedSteps.find((step) => step.translatedTip)?.translatedTip
    || 'ប្រើគ្រឿងផ្សំស្រស់ និងកែរសជាតិតាមចំណូលចិត្តរបស់អ្នក ដើម្បីឲ្យម្ហូបកាន់តែឆ្ងាញ់។';
  const dietaryTags = recipe.dietary.map((dietaryLabel) => translateDietaryLabel(dietaryLabel));

  const statCards = [
    { icon: <Star size={18} />, value: toKhmerNumber(recipe.rating.toFixed(1)), label: 'ពិន្ទុ' },
    { icon: <Clock3 size={18} />, value: formatDurationLabel(totalTime), label: 'ពេលចម្អិន' },
    { icon: <Sparkles size={18} />, value: translateDifficulty(recipe.difficulty), label: 'កម្រិត' },
    { icon: <Users size={18} />, value: `${displayServings} នាក់`, label: 'បរិមាណ' },
  ];

  const exportStatCards = [
    { icon: <Clock3 size={22} />, label: 'ពេលរៀបចំ', value: formatDurationLabel(recipe.prepTime) },
    { icon: <ChefHat size={22} />, label: 'ពេលចម្អិន', value: formatDurationLabel(recipe.cookTime) },
    { icon: <Sparkles size={22} />, label: 'កម្រិត', value: translateDifficulty(recipe.difficulty) },
  ];

  const toggleIngredient = (ingredientName) => {
    setCheckedIngredients((previous) => (
      previous.includes(ingredientName)
        ? previous.filter((name) => name !== ingredientName)
        : [...previous, ingredientName]
    ));
  };

  const handleDownloadPDF = async () => {
    if (!exportRef.current || isDownloading) {
      return;
    }

    setIsDownloading(true);

    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      await waitForEmbeddedImages(exportRef.current);

      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const margin = 6;
      const pageWidth = pdf.internal.pageSize.getWidth() - (margin * 2);
      const pageHeight = pdf.internal.pageSize.getHeight() - (margin * 2);
      const imageHeight = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imageHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, pageWidth, imageHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imageHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, pageWidth, imageHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      pdf.save(`${recipe.id}-recipe-sheet.pdf`);
      showStatusMessage('បានទាញយកឯកសារ PDF រួចរាល់');
    } catch (error) {
      console.error('Failed to generate PDF', error);
      showStatusMessage('មិនអាចទាញយកឯកសារ PDF បានទេ');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: recipeTitle,
      text: summary,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        showStatusMessage('បានចែករំលែករូបមន្តរួចរាល់');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        showStatusMessage('បានចម្លងតំណភ្ជាប់រួចរាល់');
      } else {
        showStatusMessage('មិនអាចចែករំលែករូបមន្តបានទេ');
      }
    } catch (error) {
      console.error('Failed to share recipe', error);
      showStatusMessage('មិនអាចចែករំលែករូបមន្តបានទេ');
    }
  };

  return (
    <div className="recipe-detail-page">
      <div className="container recipe-detail-shell">
        <section className="recipe-hero-card" style={{ backgroundImage: heroImage }}>
          <div className="recipe-hero-overlay">
            <div className="recipe-hero-topbar">
              <Link to="/search" className="recipe-back-link">
                <ArrowLeft size={18} />
                ត្រឡប់ទៅការស្វែងរក
              </Link>

              <div className="recipe-hero-actions">
                <button type="button" className="recipe-icon-btn" onClick={() => window.print()} aria-label="បោះពុម្ពរូបមន្ត">
                  <Printer size={18} />
                </button>
                <button
                  type="button"
                  className={`recipe-icon-btn ${isSaved ? 'recipe-icon-btn-active' : ''}`}
                  onClick={() => setIsSaved((previous) => !previous)}
                  aria-label="រក្សាទុករូបមន្ត"
                >
                  <Heart size={18} />
                </button>
                <button type="button" className="recipe-icon-btn" onClick={handleShare} aria-label="ចែករំលែករូបមន្ត">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            <div className="recipe-hero-content">
              <div className="recipe-hero-badges">
                <span className="hero-badge hero-badge-accent">{translateCategory(recipe.category)}</span>
                <span className="hero-badge"><Star size={14} /> {toKhmerNumber(recipe.rating.toFixed(1))}</span>
                <span className="hero-badge"><Clock3 size={14} /> {formatDurationLabel(totalTime)}</span>
                <span className="hero-badge"><Sparkles size={14} /> {translateDifficulty(recipe.difficulty)}</span>
                <button
                  type="button"
                  className="hero-badge hero-badge-button"
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                >
                  <Download size={14} />
                  {isDownloading ? 'កំពុងបង្កើត PDF...' : 'ទាញយក PDF'}
                </button>
              </div>

              <h1 className="recipe-hero-title">{recipeTitle}</h1>
              {recipeSubtitle ? <p className="recipe-hero-subtitle">{recipeSubtitle}</p> : null}
              <p className="recipe-hero-summary">{summary}</p>

              {statusMessage ? <p className="recipe-share-message">{statusMessage}</p> : null}
            </div>
          </div>
        </section>

        <section className="recipe-stats-grid">
          {statCards.map((stat) => (
            <div key={stat.label} className="recipe-stat-card">
              <div className="recipe-stat-icon">{stat.icon}</div>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </section>

        <section className="recipe-detail-content">
          <aside className="recipe-ingredients-card">
            <div className="recipe-panel-header">
              <div>
                <h2>គ្រឿងផ្សំ</h2>
                <p>{toKhmerNumber(checkedCount)} / {toKhmerNumber(recipe.ingredients.length)} បានរៀបចំ</p>
              </div>

              <div className="recipe-servings-control">
                <span>បរិមាណ</span>
                <div className="recipe-servings-buttons">
                  <button
                    type="button"
                    className="recipe-servings-btn"
                    onClick={() => setServingsMultiplier((previous) => Math.max(0.5, previous - 0.5))}
                  >
                    -
                  </button>
                  <strong>x{formatDisplayNumber(servingsMultiplier)}</strong>
                  <button
                    type="button"
                    className="recipe-servings-btn"
                    onClick={() => setServingsMultiplier((previous) => previous + 0.5)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="recipe-ingredient-list">
              {recipe.ingredients.map((ingredient, index) => {
                const checked = checkedIngredients.includes(ingredient.name);

                return (
                  <button
                    key={`${ingredient.name}-${index}`}
                    type="button"
                    className={`recipe-ingredient-item ${checked ? 'recipe-ingredient-item-active' : ''}`}
                    onClick={() => toggleIngredient(ingredient.name)}
                  >
                    <span className={`recipe-ingredient-check ${checked ? 'recipe-ingredient-check-active' : ''}`}>
                      {checked ? <CheckCircle2 size={18} /> : null}
                    </span>
                    <span className="recipe-ingredient-copy">
                      <strong>{translateIngredientName(ingredient.name)}</strong>
                      <span>{formatScaledAmount(ingredient.amount, servingsMultiplier)}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="recipe-ingredient-footer">
              <div className="recipe-dietary-tags">
                {dietaryTags.map((dietaryLabel) => (
                  <span key={dietaryLabel} className="recipe-dietary-tag">
                    {dietaryLabel}
                  </span>
                ))}
              </div>

              <Link to={`/cooking/${recipe.id}`} className="recipe-cook-btn">
                <ChefHat size={20} />
                បើករបៀបចម្អិន
              </Link>
            </div>
          </aside>

          <section className="recipe-method-card">
            <div className="recipe-panel-header recipe-panel-header-wide">
              <div>
                <h2>របៀបធ្វើ</h2>
                <p>{toKhmerNumber(recipe.steps.length)} ជំហានសម្រាប់ការចម្អិនម្ហូបនេះ</p>
              </div>

              <div className="recipe-method-toolbar">
                <button type="button" className="recipe-toolbar-btn" onClick={handleDownloadPDF} disabled={isDownloading}>
                  <Download size={16} />
                  {isDownloading ? 'កំពុងបង្កើត...' : 'PDF'}
                </button>
                <button type="button" className="recipe-toolbar-btn" onClick={() => window.print()}>
                  <Printer size={16} />
                  បោះពុម្ព
                </button>
                <button type="button" className="recipe-toolbar-btn" onClick={handleShare}>
                  <Share2 size={16} />
                  ចែករំលែក
                </button>
              </div>
            </div>

            <div className="recipe-method-intro">
              <div className="recipe-intro-badge">
                <Sparkles size={16} />
                គន្លឹះនៃម្ហូបនេះ
              </div>
              <p>{summary}</p>
            </div>

            <div className="recipe-step-list">
              {translatedSteps.map((step, index) => (
                <article key={`${step.instruction}-${index}`} className="recipe-step-card">
                  <div className="recipe-step-marker">
                    <span>{toKhmerNumber(index + 1)}</span>
                  </div>

                  <div className="recipe-step-content">
                    <div className="recipe-step-meta">
                      <h3>{step.translatedInstruction}</h3>
                      <span>{formatStepDuration(step.timer)}</span>
                    </div>

                    <p className={`recipe-step-tip ${step.translatedTip ? '' : 'recipe-step-tip-muted'}`}>
                      {step.translatedTip || getFallbackStepCopy()}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>

        <section className="related-recipes-section">
          <div className="related-recipes-header">
            <div>
              <h2>ម្ហូបដែលស្រដៀង</h2>
              <p>ជ្រើសម្ហូបផ្សេងៗទៀតដែលសមស្របជាមួយរសជាតិ និងប្រភេទដូចគ្នា។</p>
            </div>
            <Link to="/search" className="related-recipes-link">
              មើលបន្ថែម
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="related-recipes-grid">
            {relatedRecipes.map((item) => {
              const itemSubtitle = getRecipeSecondaryTitle(item);

              return (
                <Link key={item.id} to={`/recipe/${item.id}`} className="related-recipe-card">
                  <div
                    className="related-recipe-image"
                    style={{ backgroundImage: `url("${encodeURI(item.image)}")` }}
                  />
                  <div className="related-recipe-content">
                    <div className="related-recipe-topline">
                      <span>{translateCategory(item.category)}</span>
                      <span><Star size={12} /> {toKhmerNumber(item.rating.toFixed(1))}</span>
                    </div>
                    <h3>{getRecipeDisplayTitle(item)}</h3>
                    {itemSubtitle ? <p>{itemSubtitle}</p> : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <div className="recipe-export-stage" aria-hidden="true">
        <article className="recipe-export-sheet" ref={exportRef}>
          <header className="recipe-export-header">
            <div className="recipe-export-brand">
              <span className="recipe-export-brand-icon">
                <ChefHat size={20} />
              </span>
              <div>
                <strong>សៀវភៅរូបមន្តម្ហូប</strong>
                <p>Flamer & Chef</p>
              </div>
            </div>

            <div className="recipe-export-header-actions">
              <div className="recipe-export-action-chip">
                <Printer size={15} />
                បោះពុម្ព
              </div>
              <div className="recipe-export-action-chip recipe-export-action-chip-strong">
                <Share2 size={15} />
                ចែករំលែក
              </div>
            </div>
          </header>

          <div className="recipe-export-content">
            <section className="recipe-export-hero">
              <div className="recipe-export-image-frame">
                <img src={exportImageSrc} alt={recipeTitle} className="recipe-export-image" />
              </div>

              <div className="recipe-export-hero-copy">
                <span className="recipe-export-category">{translateCategory(recipe.category)}</span>
                <h1>{exportTitle}</h1>
                <p>{summary}</p>

                <div className="recipe-export-stats">
                  {exportStatCards.map((stat) => (
                    <div key={stat.label} className="recipe-export-stat-card">
                      <div className="recipe-export-stat-icon">{stat.icon}</div>
                      <span>{stat.label}</span>
                      <strong>{stat.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="recipe-export-divider" />

            <section className="recipe-export-columns">
              <aside className="recipe-export-panel">
                <div className="recipe-export-section-title">
                  <span />
                  គ្រឿងផ្សំ
                </div>

                <div className="recipe-export-ingredient-list">
                  {recipe.ingredients.map((ingredient, index) => (
                    <div key={`${ingredient.name}-${index}`} className="recipe-export-ingredient-item">
                      <span className="recipe-export-ingredient-box" />
                      <div className="recipe-export-ingredient-copy">
                        <strong>{translateIngredientName(ingredient.name)}</strong>
                        <span>{formatScaledAmount(ingredient.amount, servingsMultiplier)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="recipe-export-note">
                  <strong>គន្លឹះចុងភៅ</strong>
                  <p>{chefNote}</p>
                </div>
              </aside>

              <section className="recipe-export-panel">
                <div className="recipe-export-section-title">
                  <span />
                  របៀបធ្វើ
                </div>

                <div className="recipe-export-step-list">
                  {translatedSteps.map((step, index) => (
                    <article key={`${step.instruction}-export-${index}`} className="recipe-export-step-item">
                      <div className="recipe-export-step-number">{toKhmerNumber(index + 1)}</div>
                      <div className="recipe-export-step-copy">
                        <div className="recipe-export-step-heading">
                          <h3>ជំហានទី {toKhmerNumber(index + 1)}</h3>
                          <span>{formatStepDuration(step.timer)}</span>
                        </div>
                        <p className="recipe-export-step-instruction">{step.translatedInstruction}</p>
                        <p className="recipe-export-step-note-text">{step.translatedTip || getFallbackStepCopy()}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </section>
          </div>

          <footer className="recipe-export-footer">
            ឯកសាររូបមន្ត Flamer & Chef © {toKhmerNumber(new Date().getFullYear())}
          </footer>
        </article>
      </div>
    </div>
  );
}
