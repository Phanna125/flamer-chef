import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChefHat,
  ListChecks,
  Mic,
  MicOff,
  Sparkles,
  Timer,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRecipes } from '../hooks/useRecipes';
import './CookingMode.css';

const speakSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

const CATEGORY_TRANSLATIONS = {
  'Stir-fry': 'ម្ហូបឆា',
  'Soup & Stew': 'សម្ល',
  Rice: 'បាយ',
  Noodles: 'មី និងគុយទាវ',
};

const STYLE_TRANSLATIONS = {
  'stir-fried with basil': 'ឆាម្រះព្រៅ',
  'stir-fried with ginger': 'ឆាខ្ញី',
  'stir-fried sweet & sour': 'ឆាជូរអែម',
  'sour soup': 'សម្លម្ជូរ',
  curry: 'ការី',
  'fried rice': 'បាយឆា',
  'noodle soup': 'គុយទាវទឹក',
};

const INGREDIENT_TRANSLATIONS = {
  chicken: 'សាច់មាន់',
  pork: 'សាច់ជ្រូក',
  beef: 'សាច់គោ',
  shrimp: 'បង្គា',
  squid: 'មឹក',
  tofu: 'តៅហ៊ូ',
  fish: 'ត្រី',
  'fish fillet (snakehead or catfish)': 'សាច់ត្រីកាត់ដុំ (ត្រីរ៉ស់ ឬ ត្រីឆ្ដោ)',
  'coconut milk': 'ខ្ទិះដូង',
  'kroeung (lemongrass paste)': 'គ្រឿងគល់ស្លឹកគ្រៃ',
  'kaffir lime leaves': 'ស្លឹកក្រូចសើច',
  'fish sauce': 'ទឹកត្រី',
  sugar: 'ស្ករ',
  egg: 'ស៊ុត',
  'beef tenderloin': 'សាច់គោសាច់ទន់',
  'soy sauce': 'ទឹកស៊ីអ៊ីវ',
  'oyster sauce': 'ទឹកប្រេងខ្យង',
  tomato: 'ប៉េងប៉ោះ',
  lettuce: 'សាឡាត់',
  'kampot pepper': 'ម្រេចកំពត',
  lime: 'ក្រូចឆ្មារ',
  garlic: 'ខ្ទឹមស',
  'pork belly or fish': 'សាច់ជ្រូកបីជាន់ ឬ ត្រី',
  prahok: 'ប្រហុក',
  kroeung: 'គ្រឿង',
  'roasted ground rice': 'អង្ករលីងបុក',
  'green papaya': 'ល្ហុងខ្ចី',
  pumpkin: 'ល្ពៅ',
  'holy basil': 'ស្លឹកម្រះព្រៅ',
  'fresh rice noodles': 'នំបញ្ចុកស្រស់',
  'snakehead fish or tilapia': 'ត្រីរ៉ស់ ឬ ត្រីទីឡាព្យា',
  'banana blossom': 'ត្រយូងចេក',
  cucumber: 'ត្រសក់',
  'mint leaves': 'ស្លឹកជីអង្កាម',
  'pork neck or shoulder': 'សាច់កជ្រូក ឬ ស្មាជ្រូក',
  'palm sugar': 'ស្ករត្នោត',
  'broken rice': 'អង្ករបាក់',
  'daikon radish': 'ឆៃថាវ',
  'fresh ginger': 'ខ្ញីស្រស់',
  'cooking oil': 'ប្រេងឆា',
  'soy sauce or fish sauce': 'ទឹកស៊ីអ៊ីវ ឬ ទឹកត្រី',
  'mixed vegetables': 'បន្លែចម្រុះ',
};

const STEP_TRANSLATIONS = {
  'Slice the fish into bite-sized pieces.': 'កាត់ត្រីជាដុំតូចៗសម្រាប់មួយម៉ាត់។',
  'Mix coconut milk, kroeung, fish sauce, and egg in a bowl.': 'លាយខ្ទិះដូង គ្រឿង ទឹកត្រី និងស៊ុតក្នុងចានមួយ។',
  'Gently fold the fish into the mixture.': 'ដាក់ត្រីចូល ហើយកូរបន្តិចៗឲ្យសព្វជាមួយល្បាយ។',
  'Pour the mixture into banana leaf bowls (or ramekins).': 'ចាក់ល្បាយចូលក្នុងកន្ទេលស្លឹកចេក ឬ ចានតូចសម្រាប់ចំហុយ។',
  'Steam for 30-40 minutes until set.': 'ចំហុយរយៈពេល 30-40 នាទី រហូតដល់សាច់អាម៉ុកជាប់ល្អ។',
  'Marinate the beef with soy sauce, oyster sauce, and minced garlic for 15 mins.': 'ប្រឡាក់សាច់គោជាមួយទឹកស៊ីអ៊ីវ ទឹកប្រេងខ្យង និងខ្ទឹមសចិញ្ច្រាំរយៈពេល 15 នាទី។',
  'Prepare the dipping sauce: mix lime juice, Kampot pepper, and a pinch of salt.': 'រៀបចំទឹកជ្រលក់ដោយលាយទឹកក្រូចឆ្មារ ម្រេចកំពត និងអំបិលបន្តិច។',
  'Sear the beef quickly in a hot pan.': 'ឆាសាច់គោលើខ្ទះក្តៅឲ្យរហ័ស។',
  'Serve over a bed of fresh lettuce and sliced tomatoes.': 'បម្រើលើសាឡាត់ស្រស់ និងប៉េងប៉ោះកាត់ស្លឹក។',
  'Stir-fry kroeung and prahok until fragrant.': 'ឆាគ្រឿង និងប្រហុករហូតដល់មានក្លិនឈ្ងុយ។',
  'Add meat and brown on all sides.': 'ដាក់សាច់ចូល ហើយឆាឲ្យសព្វគ្រប់ជ្រុង។',
  'Add roasted ground rice and stir well.': 'បន្ថែមអង្ករលីងបុក ហើយកូរឲ្យសព្វ។',
  'Add water to cover and simmer.': 'ចាក់ទឹកឲ្យលើសគ្រឿងបន្តិច ហើយដាំឲ្យពុះតិចៗ។',
  'Add vegetables sequentially based on their cooking time (hardest first).': 'ដាក់បន្លែតាមលំដាប់ពេលចម្អិន ដោយដាក់បន្លែរឹងមុន។',
  'Simmer until all vegetables are tender. Garnish with basil.': 'ដាំបន្តរហូតដល់បន្លែទន់ល្អ ហើយរោយស្លឹកម្រះព្រៅពីលើ។',
  'Boil the fish until cooked, then debone and lightly pound the meat.': 'ស្ងោរត្រីឲ្យឆ្អិន រួចដោះឆ្អឹង និងបុកសាច់ត្រីស្រាលៗ។',
  'Stir-fry kroeung in a pan until fragrant, then add the pounded fish.': 'ឆាគ្រឿងក្នុងខ្ទះរហូតឈ្ងុយ បន្ទាប់មកដាក់សាច់ត្រីដែលបានបុក។',
  'Add coconut milk and water, simmer into a light green gravy.': 'បន្ថែមខ្ទិះដូង និងទឹក រួចដាំឲ្យក្លាយជាទឹកសម្លពណ៌បៃតងស្រាល។',
  'Serve noodles in a bowl, pour the hot gravy over.': 'ដាក់នំបញ្ចុកក្នុងចាន ហើយចាក់ទឹកសម្លក្តៅពីលើ។',
  'Top with fresh shredded banana blossom, cucumber, and mint.': 'បន្ថែមត្រយូងចេកហាន់ស្រួយ ត្រសក់ និងស្លឹកជីអង្កាមពីលើ។',
  'Marinate thinly sliced pork with garlic, soy sauce, and palm sugar.': 'ប្រឡាក់សាច់ជ្រូកស្តើងៗជាមួយខ្ទឹមស ទឹកស៊ីអ៊ីវ និងស្ករត្នោត។',
  'Grill pork slices over hot coals until caramelized and cooked.': 'អាំងសាច់ជ្រូកលើភ្លើងក្តៅរហូតដល់មានពណ៌ត្នោត និងឆ្អិនល្អ។',
  'Cook the broken rice to a fluffy consistency.': 'ចម្អិនអង្ករបាក់ឲ្យទន់ស្រាល។',
  'Quickly pickle sliced cucumber and daikon in a vinegar-sugar mix.': 'ត្រាំត្រសក់ និងឆៃថាវកាត់ស្លឹកជាមួយទឹកខ្មេះនិងស្ករយ៉ាងរហ័ស។',
  'Serve grilled pork over rice with pickled vegetables.': 'បម្រើសាច់ជ្រូកអាំងលើបាយ ជាមួយបន្លែជ្រក់។',
  'Heat a pan or wok with oil and add the aromatic ingredients.': 'កម្តៅខ្ទះ ឬ វុកជាមួយប្រេង បន្ទាប់មកបន្ថែមគ្រឿងក្លិន។',
  'Serve hot with a side of steamed rice or complementary side dish.': 'បម្រើក្តៅៗ ជាមួយបាយស ឬ ម្ហូបអមតាមចំណូលចិត្ត។',
};

const TIP_TRANSLATIONS = {
  'Use a firm white fish like snakehead or snapper.': 'ប្រើត្រីសាច់សដូចជា ត្រីរ៉ស់ ឬ ត្រីសណ្តោង ដើម្បីឲ្យសាច់នៅជាប់ល្អ។',
  "Check with a toothpick to ensure it's cooked through.": 'សាកដោយឈើចាក់ធ្មេញ ដើម្បីប្រាកដថាឆ្អិនដល់ខាងក្នុង។',
  'Kampot pepper is key to authentic flavor.': 'ម្រេចកំពតជាគន្លឹះសំខាន់សម្រាប់រសជាតិដើម។',
  "Don't overcook, keep it tender.": 'កុំឆាឲ្យយូរពេក ដើម្បីរក្សាសាច់ឲ្យទន់។',
  'This thickens the soup and adds a nutty flavor.': 'វាជួយឲ្យសម្លខាប់ និងផ្តល់ក្លិនឈ្ងុយបែបគ្រាប់ធញ្ញជាតិ។',
  'Adjust consistency with water.': 'អាចបន្ថែមទឹកដើម្បីកែសម្រួលកម្រាស់បាន។',
  'Overnight marination yields the best results.': 'ប្រឡាក់ទុកមួយយប់ នឹងឲ្យរសជាតិឆ្ងាញ់ជាង។',
  'Consistency helps it cook evenly.': 'កាត់ឲ្យស្មើគ្នា ដើម្បីឲ្យឆ្អិនសព្វស្មើគ្នា។',
};

function translateCategory(category) {
  return CATEGORY_TRANSLATIONS[category] || category;
}

function translateStyle(style) {
  return STYLE_TRANSLATIONS[style.toLowerCase()] || style;
}

function translateIngredientName(name) {
  return INGREDIENT_TRANSLATIONS[name.toLowerCase()] || name;
}

function translateAmount(amount) {
  if (!amount) {
    return amount;
  }

  if (amount.toLowerCase() === 'amount varies') {
    return 'បរិមាណតាមចំណូលចិត្ត';
  }

  return amount
    .replace(/\bcups?\b/gi, 'ពែង')
    .replace(/\btbsp\b/gi, 'ស្លាបព្រាបាយ')
    .replace(/\btsp\b/gi, 'ស្លាបព្រាកាហ្វេ')
    .replace(/\bcloves?\b/gi, 'កំពឹស')
    .replace(/\bhead\b/gi, 'ក្បាល')
    .replace(/\bbunch\b/gi, 'ក្តាប់')
    .replace(/\bleaves?\b/gi, 'ស្លឹក');
}

function translateInstruction(instruction) {
  if (STEP_TRANSLATIONS[instruction]) {
    return STEP_TRANSLATIONS[instruction];
  }

  let match = instruction.match(/^Prepare the (.+) and chop into even pieces\.$/);
  if (match) {
    return `រៀបចំ${translateIngredientName(match[1])} ហើយកាត់ជាដុំស្មើៗគ្នា។`;
  }

  match = instruction.match(/^Add the (.+) and cook until golden brown\.$/);
  if (match) {
    return `បន្ថែម${translateIngredientName(match[1])} ហើយចម្អិនរហូតដល់ឡើងពណ៌មាស។`;
  }

  match = instruction.match(/^Add seasonings appropriate for (.+) and stir thoroughly\.$/);
  if (match) {
    return `បន្ថែមគ្រឿងទេសសម្រាប់${translateStyle(match[1])} ហើយកូរឲ្យសព្វ។`;
  }

  return instruction;
}

function translateTip(tip) {
  if (!tip) {
    return '';
  }

  return TIP_TRANSLATIONS[tip] || tip;
}

export default function CookingMode() {
  const { id } = useParams();
  const { recipes, loading } = useRecipes();
  const recipe = recipes.find((item) => item.id === id);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(() => recipe?.steps[0]?.timer ?? null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const stopSpeaking = () => {
    if (!speakSupported) {
      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  useEffect(() => {
    const chromeElements = Array.from(document.querySelectorAll('.navbar, .footer-container'));
    const previousDisplays = chromeElements.map((element) => element.style.display);

    chromeElements.forEach((element) => {
      element.style.display = 'none';
    });

    return () => {
      chromeElements.forEach((element, index) => {
        element.style.display = previousDisplays[index];
      });
      if (speakSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (!isTimerRunning || timeLeft === null || timeLeft === 0) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setTimeLeft((previous) => {
        if (previous === null || previous <= 0) {
          return 0;
        }

        if (previous === 1) {
          setIsTimerRunning(false);
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([180, 120, 180]);
          }
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isTimerRunning, timeLeft]);

  if (loading && !recipe) {
    return <div className="container">កំពុងទាញយករូបមន្តម្ហូប...</div>;
  }

  if (!recipe) {
    return <div className="container">រកមិនឃើញរូបមន្តម្ហូប</div>;
  }

  const formatTime = (seconds) => {
    if (seconds === null) {
      return '--:--';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const totalSteps = recipe.steps.length;
  const step = recipe.steps[currentStep];
  const progress = isFinished ? 100 : Math.round(((currentStep + 1) / totalSteps) * 100);
  const imageUrl = `url("${encodeURI(recipe.image)}")`;
  const checkedCount = checkedIngredients.length;
  const recipeTitle = recipe.name.km || recipe.name.en;
  const translatedInstruction = translateInstruction(step.instruction);
  const translatedTip = translateTip(step.tip);
  const helperCopy = translatedTip || 'រក្សាកម្តៅឲ្យថេរ ហើយរៀបចំគ្រឿងបន្ទាប់នៅពេលជំហាននេះកំពុងចម្អិន។';
  const displayedTime = step.timer ? formatTime(timeLeft ?? step.timer) : 'មិនចាំបាច់កំណត់ម៉ោង';

  const toggleIngredient = (ingredientName) => {
    setCheckedIngredients((previous) => (
      previous.includes(ingredientName)
        ? previous.filter((name) => name !== ingredientName)
        : [...previous, ingredientName]
    ));
  };

  const jumpToStep = (stepIndex) => {
    const nextStep = recipe.steps[stepIndex];
    setCurrentStep(stepIndex);
    setTimeLeft(nextStep?.timer ?? null);
    setIsTimerRunning(false);
    stopSpeaking();
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      jumpToStep(currentStep + 1);
      return;
    }

    setIsFinished(true);
    stopSpeaking();
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFCC00', '#FFD84D', '#111827'],
    });
  };

  const handlePrev = () => {
    if (currentStep === 0) {
      return;
    }

    jumpToStep(currentStep - 1);
  };

  const handleVoiceToggle = () => {
    if (!speakSupported) {
      return;
    }

    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(
      `${translatedInstruction}${translatedTip ? `។ គន្លឹះ៖ ${translatedTip}` : ''}`
    );
    utterance.lang = 'km-KH';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleTimerToggle = () => {
    if (!step.timer) {
      return;
    }

    if (timeLeft === 0) {
      setTimeLeft(step.timer);
      setIsTimerRunning(true);
      return;
    }

    if (timeLeft === null) {
      setTimeLeft(step.timer);
      setIsTimerRunning(true);
      return;
    }

    setIsTimerRunning((previous) => !previous);
  };

  const handleTimerReset = () => {
    if (!step.timer) {
      return;
    }

    setTimeLeft(step.timer);
    setIsTimerRunning(false);
  };

  if (isFinished) {
    return (
      <div className="cooking-mode-page">
        <div className="cooking-shell">
          <div className="cooking-finish-card">
            <div className="finish-icon-wrap">
              <CheckCircle2 size={42} />
            </div>
            <p className="finish-kicker">ចម្អិនរួចរាល់</p>
            <h1>{recipeTitle}</h1>
            <p className="finish-copy">
              អ្នកបានធ្វើគ្រប់ជំហានរួចហើយ។ សម្រាកបន្តិច រៀបចំដាក់ចាន ហើយរីករាយជាមួយម្ហូបដែលអ្នកទើបតែចម្អិន។
            </p>

            <div className="finish-summary-grid">
              <div className="finish-summary-card">
                <span>ជំហានដែលបានបញ្ចប់</span>
                <strong>{totalSteps}</strong>
              </div>
              <div className="finish-summary-card">
                <span>គ្រឿងផ្សំដែលបានត្រៀម</span>
                <strong>{checkedCount}/{recipe.ingredients.length}</strong>
              </div>
            </div>

            <div className="finish-actions">
              <Link to={`/recipe/${recipe.id}`} className="finish-secondary-btn">
                <ArrowLeft size={20} />
                ត្រឡប់ទៅរូបមន្ត
              </Link>
              <Link to="/" className="finish-primary-btn">
                ចម្អិនមុខម្ហូបផ្សេង
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cooking-mode-page">
      <header className="cooking-topbar">
        <div className="cooking-brand">
          <div className="cooking-brand-icon">
            <ChefHat size={24} />
          </div>
          <div>
            <p className="cooking-brand-title">របៀបចម្អិន</p>
            <p className="cooking-brand-subtitle">{recipeTitle}</p>
          </div>
        </div>

        <div className="cooking-top-actions">
          <button
            type="button"
            className="cooking-round-btn"
            onClick={handleVoiceToggle}
            aria-label={isSpeaking ? 'បញ្ឈប់ការណែនាំជាសំឡេង' : 'អានជំហាននេះជាសំឡេង'}
            title={isSpeaking ? 'បញ្ឈប់ការណែនាំជាសំឡេង' : 'អានជំហាននេះជាសំឡេង'}
          >
            {isSpeaking ? <MicOff size={21} /> : <Mic size={21} />}
          </button>

          <Link
            to={`/recipe/${recipe.id}`}
            className="cooking-round-btn cooking-round-btn-muted"
            aria-label="ចាកចេញពីរបៀបចម្អិន"
            title="ចាកចេញពីរបៀបចម្អិន"
          >
            <X size={22} />
          </Link>
        </div>
      </header>

      <div className="cooking-shell">
        <section className="cooking-progress-panel">
          <div className="cooking-progress-meta">
            <div>
              <p className="progress-label">ជំហានទី {currentStep + 1} នៃ {totalSteps}</p>
              <h1 className="progress-title">ចម្អិនតាមល្បឿនរបស់អ្នក</h1>
            </div>
            <span className="progress-value">{progress}% បានបញ្ចប់</span>
          </div>

          <div className="cooking-progress-track">
            <div className="cooking-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </section>

        <div className="cooking-layout">
          <section className="cooking-main-column">
            <div className="cooking-image-card" style={{ backgroundImage: imageUrl }}>
              <div className="cooking-image-overlay">
                <span className="image-chip">{translateCategory(recipe.category)}</span>
                <span className="image-step-badge">ជំហានបច្ចុប្បន្ន #{currentStep + 1}</span>
              </div>
            </div>

            <article className="cooking-instruction-card">
              <div className="instruction-header">
                <span className="instruction-kicker">សេចក្តីណែនាំ</span>
                <div className="instruction-timer-pill">
                  <Timer size={18} />
                  <span>{step.timer ? displayedTime : 'មិនចាំបាច់កំណត់ម៉ោង'}</span>
                </div>
              </div>

              <h2>{translatedInstruction}</h2>
              <p className="instruction-support">
                {helperCopy}
              </p>

              <div className="instruction-detail-grid">
                <div className="detail-card">
                  <span className="detail-label">ចំណុចសំខាន់</span>
                  <strong>{step.tip ? 'អនុវត្តតាមគន្លឹះខាងក្រោម' : 'មើលពណ៌ និងសភាពម្ហូប'}</strong>
                  <p>{translatedTip || 'ស្នាក់នៅក្បែរខ្ទះ ហើយសង្កេតពណ៌ និងសភាពម្ហូប មុនពេលបន្តទៅជំហានបន្ទាប់។'}</p>
                </div>

                <div className="detail-card detail-card-accent">
                  <span className="detail-label">ការគ្រប់គ្រងម៉ោង</span>
                  <strong>{step.timer ? (timeLeft === 0 ? 'ម៉ោងបានចប់' : isTimerRunning ? 'ម៉ោងកំពុងដំណើរការ' : 'ត្រៀមចាប់ម៉ោង') : 'មិនមានម៉ោងកំណត់'}</strong>
                  <p>
                    {step.timer
                      ? 'អ្នកអាចចាប់ម៉ោង ផ្អាក ឬ កំណត់ឡើងវិញ សម្រាប់ជំហាននេះបានគ្រប់ពេល។'
                      : 'ជំហាននេះមិនចាំបាច់កំណត់ម៉ោងទេ ដូច្នេះសូមផ្តោតលើសភាព និងរសជាតិ។'}
                  </p>

                  {step.timer && (
                    <div className="detail-card-actions">
                      <button type="button" className="inline-action-btn" onClick={handleTimerToggle}>
                        {timeLeft === 0 ? 'ចាប់ម្ដងទៀត' : isTimerRunning ? 'ផ្អាកម៉ោង' : 'ចាប់ម៉ោង'}
                      </button>
                      <button type="button" className="inline-action-btn inline-action-btn-muted" onClick={handleTimerReset}>
                        កំណត់ឡើងវិញ
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>

            <div className="cooking-nav-row">
              <button
                type="button"
                className="cooking-nav-btn cooking-nav-btn-secondary"
                onClick={handlePrev}
                disabled={currentStep === 0}
              >
                <ArrowLeft size={22} />
                ជំហានមុន
              </button>

              <button type="button" className="cooking-nav-btn cooking-nav-btn-primary" onClick={handleNext}>
                {currentStep === totalSteps - 1 ? 'បញ្ចប់ការចម្អិន' : 'ជំហានបន្ទាប់'}
                {currentStep === totalSteps - 1 ? <CheckCircle2 size={22} /> : <ArrowRight size={22} />}
              </button>
            </div>
          </section>

          <aside className="cooking-sidebar">
            <section className="ingredients-panel">
              <div className="ingredients-panel-header">
                <div className="ingredients-heading">
                  <ListChecks size={24} />
                  <div>
                    <h3>គ្រឿងផ្សំ</h3>
                    <p>{checkedCount} / {recipe.ingredients.length} បានរៀបចំ</p>
                  </div>
                </div>
              </div>

              <div className="ingredient-checklist">
                {recipe.ingredients.map((ingredient) => {
                  const checked = checkedIngredients.includes(ingredient.name);

                  return (
                    <button
                      key={ingredient.name}
                      type="button"
                      className={`ingredient-check-item ${checked ? 'ingredient-check-item-active' : ''}`}
                      onClick={() => toggleIngredient(ingredient.name)}
                    >
                      <span className={`ingredient-checkmark ${checked ? 'ingredient-checkmark-active' : ''}`}>
                        {checked ? <CheckCircle2 size={18} /> : null}
                      </span>
                      <span className="ingredient-copy">
                        <strong>{translateIngredientName(ingredient.name)}</strong>
                        <span className={checked ? 'ingredient-amount ingredient-amount-checked' : 'ingredient-amount'}>
                          {translateAmount(ingredient.amount)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="ingredient-note">
                <div className="ingredient-note-icon">
                  <Sparkles size={18} />
                </div>
                <div>
                  <strong>{step.timer ? `ពេលវេលាណែនាំ៖ ${displayedTime}` : 'កំណត់ចំណាំពីចុងភៅ'}</strong>
                  <p>{translatedTip || 'ចុចសម្គាល់គ្រឿងផ្សំដែលអ្នកបានរៀបចំរួច ដើម្បីងាយស្រួលតាមដាន។'}</p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
