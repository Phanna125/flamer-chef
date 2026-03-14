import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ImageUp,
  LoaderCircle,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useRecipes } from '../hooks/useRecipes';
import { siteOwner } from '../data/siteLinks';
import {
  createEmptyRecipeForm,
  deleteRecipeFromSupabase,
  recipeToFormValues,
  saveRecipeToSupabase,
  uploadRecipeImage,
} from '../lib/adminApi';
import './AdminPage.css';

const NEW_RECIPE_ID = '__new__';

const EMPTY_INGREDIENT = {
  name: '',
  amount: '',
  essential: true,
};

const EMPTY_STEP = {
  instruction: '',
  timer: '',
  tip: '',
};

function AdminPage() {
  const {
    isConfigured,
    isAuthenticated,
    isAdmin,
    loading: authLoading,
    membershipLoading,
    membershipError,
    refreshMembership,
    signInWithPassword,
    signOut,
    signUpWithPassword,
    user,
  } = useAuth();
  const { recipes, loading: recipesLoading, refreshRecipes, source } = useRecipes();

  const [authMode, setAuthMode] = useState('signIn');
  const [authValues, setAuthValues] = useState({
    email: '',
    password: '',
  });
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [recipeSearch, setRecipeSearch] = useState('');
  const [formValues, setFormValues] = useState(createEmptyRecipeForm());
  const [saveState, setSaveState] = useState({
    saving: false,
    deleting: false,
    uploading: false,
    error: '',
    message: '',
  });

  const filteredRecipes = useMemo(() => {
    const normalizedSearch = recipeSearch.trim().toLowerCase();
    const nextRecipes = [...recipes].sort((left, right) => left.name.en.localeCompare(right.name.en));

    if (!normalizedSearch) {
      return nextRecipes;
    }

    return nextRecipes.filter((recipe) => {
      const searchableText = [
        recipe.name.en,
        recipe.name.km,
        recipe.id,
        recipe.category,
      ].join(' ').toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [recipeSearch, recipes]);

  useEffect(() => {
    if (!isAdmin || recipes.length === 0 || selectedRecipeId !== null) {
      return;
    }

    const firstRecipe = recipes[0];
    setSelectedRecipeId(firstRecipe.id);
    setFormValues(recipeToFormValues(firstRecipe));
  }, [isAdmin, recipes, selectedRecipeId]);

  useEffect(() => {
    if (!selectedRecipeId || selectedRecipeId === NEW_RECIPE_ID) {
      return;
    }

    const selectedRecipe = recipes.find((recipe) => recipe.id === selectedRecipeId);

    if (selectedRecipe) {
      setFormValues(recipeToFormValues(selectedRecipe));
    }
  }, [recipes, selectedRecipeId]);

  const selectedRecipe = selectedRecipeId && selectedRecipeId !== NEW_RECIPE_ID
    ? recipes.find((recipe) => recipe.id === selectedRecipeId) || null
    : null;
  const isOwnerEmail = user?.email?.toLowerCase() === siteOwner.email.toLowerCase();

  const promoteSql = user
    ? [
        'insert into public.admin_users (user_id, email)',
        `values ('${user.id}', '${user.email || ''}')`,
        'on conflict (user_id) do update',
        'set email = excluded.email;',
      ].join('\n')
    : '';

  function updateSaveState(patch) {
    setSaveState((currentState) => ({
      ...currentState,
      ...patch,
    }));
  }

  function handleAuthValueChange(field, value) {
    setAuthValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthSubmitting(true);
    setAuthError('');
    setAuthMessage('');

    try {
      if (authMode === 'signIn') {
        await signInWithPassword(authValues);
        setAuthMessage('Signed in successfully. Checking admin access now.');
      } else {
        await signUpWithPassword(authValues);
        setAuthMessage('Account created. If email confirmation is enabled in Supabase, confirm it first, then sign in.');
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      setAuthSubmitting(false);
    }
  }

  function handleCreateRecipe() {
    setSelectedRecipeId(NEW_RECIPE_ID);
    setFormValues(createEmptyRecipeForm());
    updateSaveState({
      error: '',
      message: 'Creating a new recipe draft.',
    });
  }

  function handleSelectRecipe(recipe) {
    setSelectedRecipeId(recipe.id);
    setFormValues(recipeToFormValues(recipe));
    updateSaveState({
      error: '',
      message: '',
    });
  }

  function handleFieldChange(field, value) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  function handleIngredientChange(index, field, value) {
    setFormValues((currentValues) => ({
      ...currentValues,
      ingredients: currentValues.ingredients.map((ingredient, ingredientIndex) => (
        ingredientIndex === index
          ? { ...ingredient, [field]: value }
          : ingredient
      )),
    }));
  }

  function handleStepChange(index, field, value) {
    setFormValues((currentValues) => ({
      ...currentValues,
      steps: currentValues.steps.map((step, stepIndex) => (
        stepIndex === index
          ? { ...step, [field]: value }
          : step
      )),
    }));
  }

  function addIngredient() {
    setFormValues((currentValues) => ({
      ...currentValues,
      ingredients: [...currentValues.ingredients, { ...EMPTY_INGREDIENT }],
    }));
  }

  function removeIngredient(index) {
    setFormValues((currentValues) => ({
      ...currentValues,
      ingredients: currentValues.ingredients.length > 1
        ? currentValues.ingredients.filter((_, ingredientIndex) => ingredientIndex !== index)
        : currentValues.ingredients,
    }));
  }

  function addStep() {
    setFormValues((currentValues) => ({
      ...currentValues,
      steps: [...currentValues.steps, { ...EMPTY_STEP }],
    }));
  }

  function removeStep(index) {
    setFormValues((currentValues) => ({
      ...currentValues,
      steps: currentValues.steps.length > 1
        ? currentValues.steps.filter((_, stepIndex) => stepIndex !== index)
        : currentValues.steps,
    }));
  }

  async function handleSaveRecipe(event) {
    event.preventDefault();
    updateSaveState({
      saving: true,
      error: '',
      message: '',
    });

    try {
      const savedRecipe = await saveRecipeToSupabase(formValues);
      const nextRecipes = await refreshRecipes();
      const resolvedRecipe = savedRecipe
        || nextRecipes.find((recipe) => recipe.id === (formValues.id || '').trim())
        || nextRecipes.find((recipe) => recipe.name.en === formValues.nameEn.trim())
        || null;

      if (resolvedRecipe) {
        setSelectedRecipeId(resolvedRecipe.id);
        setFormValues(recipeToFormValues(resolvedRecipe));
      }

      updateSaveState({
        saving: false,
        message: 'Recipe saved to Supabase successfully.',
      });
    } catch (error) {
      updateSaveState({
        saving: false,
        error: error instanceof Error ? error.message : 'Failed to save recipe.',
      });
    }
  }

  async function handleDeleteRecipe() {
    if (!selectedRecipe || !window.confirm(`Delete "${selectedRecipe.name.en}"? This cannot be undone.`)) {
      return;
    }

    updateSaveState({
      deleting: true,
      error: '',
      message: '',
    });

    try {
      await deleteRecipeFromSupabase(selectedRecipe.id);
      const nextRecipes = await refreshRecipes();
      const nextSelectedRecipe = nextRecipes[0] || null;

      if (nextSelectedRecipe) {
        setSelectedRecipeId(nextSelectedRecipe.id);
        setFormValues(recipeToFormValues(nextSelectedRecipe));
      } else {
        setSelectedRecipeId(NEW_RECIPE_ID);
        setFormValues(createEmptyRecipeForm());
      }

      updateSaveState({
        deleting: false,
        message: 'Recipe deleted successfully.',
      });
    } catch (error) {
      updateSaveState({
        deleting: false,
        error: error instanceof Error ? error.message : 'Failed to delete recipe.',
      });
    }
  }

  async function handleUploadImage(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    updateSaveState({
      uploading: true,
      error: '',
      message: '',
    });

    try {
      const uploadTargetId = formValues.id || formValues.nameEn || 'recipe-image';
      const uploadedImage = await uploadRecipeImage(file, uploadTargetId);

      setFormValues((currentValues) => ({
        ...currentValues,
        image: uploadedImage.publicUrl,
      }));

      updateSaveState({
        uploading: false,
        message: 'Image uploaded. Save the recipe to keep this image URL.',
      });
    } catch (error) {
      updateSaveState({
        uploading: false,
        error: error instanceof Error ? error.message : 'Image upload failed.',
      });
    } finally {
      event.target.value = '';
    }
  }

  async function handleRefreshAdminAccess() {
    await refreshMembership();
  }

  async function handleSignOut() {
    try {
      await signOut();
      setSelectedRecipeId(null);
      setFormValues(createEmptyRecipeForm());
      updateSaveState({
        error: '',
        message: '',
      });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Failed to sign out.');
    }
  }

  return (
    <div className="admin-page">
      <div className="container admin-page-inner">
        <header className="admin-hero glass-panel">
          <div>
            <span className="admin-hero-tag">Supabase Admin</span>
            <h1>Manage recipes, images, and your owner access</h1>
            <p>
              This dashboard gives you a real backend workflow: sign in, upload food images,
              update recipes, and publish changes directly from the web app.
            </p>
          </div>
          <div className="admin-hero-status">
            <div className="admin-status-chip">
              <ShieldCheck size={18} />
              <span>{source === 'supabase' ? 'Live data from Supabase' : 'Local fallback active'}</span>
            </div>
            {isAuthenticated && (
              <button type="button" className="btn-secondary admin-signout-btn" onClick={handleSignOut}>
                <LogOut size={18} />
                Sign Out
              </button>
            )}
          </div>
        </header>

        {!isConfigured && (
          <section className="admin-state-card glass-panel">
            <h2>Supabase is not configured yet</h2>
            <p>
              Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to your env file, then restart the app.
            </p>
          </section>
        )}

        {isConfigured && (authLoading || membershipLoading) && (
          <section className="admin-state-card glass-panel">
            <LoaderCircle size={26} className="spin" />
            <h2>Checking your admin session...</h2>
            <p>We are verifying Supabase auth and your admin access.</p>
          </section>
        )}

        {isConfigured && !authLoading && !isAuthenticated && (
          <section className="admin-auth-shell">
            <div className="admin-auth-card glass-panel">
              <div className="admin-auth-header">
                <h2>{authMode === 'signIn' ? 'Admin sign in' : 'Create owner account'}</h2>
                <p>Use your Supabase email/password account to access the dashboard.</p>
              </div>

              <div className="admin-auth-toggle">
                <button
                  type="button"
                  className={authMode === 'signIn' ? 'admin-toggle-active' : ''}
                  onClick={() => setAuthMode('signIn')}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={authMode === 'signUp' ? 'admin-toggle-active' : ''}
                  onClick={() => setAuthMode('signUp')}
                >
                  Create Account
                </button>
              </div>

              <form className="admin-auth-form" onSubmit={handleAuthSubmit}>
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    value={authValues.email}
                    onChange={(event) => handleAuthValueChange('email', event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </label>
                <label>
                  <span>Password</span>
                  <input
                    type="password"
                    value={authValues.password}
                    onChange={(event) => handleAuthValueChange('password', event.target.value)}
                    placeholder="At least 6 characters"
                    minLength={6}
                    required
                  />
                </label>

                {authError && <p className="admin-error-text">{authError}</p>}
                {authMessage && <p className="admin-success-text">{authMessage}</p>}

                <button type="submit" className="btn-primary admin-auth-submit" disabled={authSubmitting}>
                  {authSubmitting ? (
                    <>
                      <LoaderCircle size={18} className="spin" />
                      Working...
                    </>
                  ) : authMode === 'signIn' ? 'Sign In' : 'Create Account'}
                </button>
              </form>
            </div>

            <aside className="admin-auth-help glass-panel">
              <h3>What happens next?</h3>
              <ul>
                <li>Create your owner account once.</li>
                <li>Promote that account into `admin_users` in Supabase.</li>
                <li>Come back here and refresh access.</li>
              </ul>
            </aside>
          </section>
        )}

        {isConfigured && !authLoading && isAuthenticated && !isAdmin && (
          <section className="admin-state-card glass-panel">
            <div className="admin-warning-header">
              <AlertTriangle size={24} />
              <h2>You are signed in, but this account is not an admin yet</h2>
            </div>
            <p>
              {isOwnerEmail
                ? 'If you already ran the owner bootstrap migration, click refresh access. If not, run the SQL below once in Supabase.'
                : 'Run the SQL below once in the Supabase SQL editor after you create your owner account. Then click refresh access.'}
            </p>

            {membershipError && (
              <p className="admin-error-text">
                {membershipError.message}
              </p>
            )}

            <div className="admin-user-meta">
              <span>Email: {user?.email || 'Unknown'}</span>
              <span>User ID: {user?.id || 'Unknown'}</span>
            </div>

            <pre className="admin-sql-block">{promoteSql}</pre>

            <div className="admin-state-actions">
              <button type="button" className="btn-primary" onClick={handleRefreshAdminAccess}>
                <RefreshCw size={18} />
                Refresh Admin Access
              </button>
              <button type="button" className="btn-secondary" onClick={handleSignOut}>
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </section>
        )}

        {isConfigured && !authLoading && isAuthenticated && isAdmin && (
          <section className="admin-dashboard">
            <aside className="admin-sidebar glass-panel">
              <div className="admin-sidebar-header">
                <div>
                  <h2>Recipe Library</h2>
                  <p>{recipes.length} recipes available</p>
                </div>
                <button type="button" className="btn-primary admin-create-btn" onClick={handleCreateRecipe}>
                  <Plus size={18} />
                  New Recipe
                </button>
              </div>

              <label className="admin-search-label">
                <span>Find recipe</span>
                <input
                  type="text"
                  value={recipeSearch}
                  onChange={(event) => setRecipeSearch(event.target.value)}
                  placeholder="Search by name, Khmer title, or ID"
                />
              </label>

              <div className="admin-recipe-list">
                {recipesLoading ? (
                  <div className="admin-list-empty">
                    <LoaderCircle size={18} className="spin" />
                    <span>Loading recipes...</span>
                  </div>
                ) : filteredRecipes.length > 0 ? (
                  filteredRecipes.map((recipe) => (
                    <button
                      type="button"
                      key={recipe.id}
                      className={`admin-recipe-item ${selectedRecipeId === recipe.id ? 'admin-recipe-item-active' : ''}`}
                      onClick={() => handleSelectRecipe(recipe)}
                    >
                      <span className="admin-recipe-item-title">{recipe.name.en}</span>
                      <span className="admin-recipe-item-subtitle">{recipe.name.km || recipe.id}</span>
                    </button>
                  ))
                ) : (
                  <div className="admin-list-empty">
                    <span>No recipes match that search yet.</span>
                  </div>
                )}
              </div>
            </aside>

            <div className="admin-editor glass-panel">
              <div className="admin-editor-header">
                <div>
                  <span className="admin-editor-tag">
                    {selectedRecipeId === NEW_RECIPE_ID ? 'New recipe' : 'Editing recipe'}
                  </span>
                  <h2>{formValues.nameEn || 'Untitled recipe'}</h2>
                </div>

                <div className="admin-editor-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleDeleteRecipe}
                    disabled={!selectedRecipe || saveState.deleting}
                  >
                    {saveState.deleting ? (
                      <>
                        <LoaderCircle size={18} className="spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={18} />
                        Delete
                      </>
                    )}
                  </button>

                  <button
                    type="submit"
                    form="admin-recipe-form"
                    className="btn-primary"
                    disabled={saveState.saving}
                  >
                    {saveState.saving ? (
                      <>
                        <LoaderCircle size={18} className="spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Recipe
                      </>
                    )}
                  </button>
                </div>
              </div>

              {(saveState.error || saveState.message) && (
                <div className={`admin-feedback ${saveState.error ? 'admin-feedback-error' : 'admin-feedback-success'}`}>
                  {saveState.error || saveState.message}
                </div>
              )}

              <form id="admin-recipe-form" className="admin-recipe-form" onSubmit={handleSaveRecipe}>
                <section className="admin-form-section">
                  <div className="admin-section-heading">
                    <h3>Recipe basics</h3>
                    <p>Update the core identity of this recipe.</p>
                  </div>

                  <div className="admin-field-grid">
                    <label>
                      <span>Recipe ID</span>
                      <input
                        type="text"
                        value={formValues.id}
                        onChange={(event) => handleFieldChange('id', event.target.value)}
                        placeholder="auto-from-name if empty"
                      />
                    </label>

                    <label>
                      <span>English name</span>
                      <input
                        type="text"
                        value={formValues.nameEn}
                        onChange={(event) => handleFieldChange('nameEn', event.target.value)}
                        placeholder="Fish Amok"
                        required
                      />
                    </label>

                    <label>
                      <span>Khmer name</span>
                      <input
                        type="text"
                        value={formValues.nameKm}
                        onChange={(event) => handleFieldChange('nameKm', event.target.value)}
                        placeholder="អាម៉ុកត្រី"
                      />
                    </label>

                    <label>
                      <span>Category</span>
                      <input
                        type="text"
                        value={formValues.category}
                        onChange={(event) => handleFieldChange('category', event.target.value)}
                        placeholder="Soup & Stew"
                      />
                    </label>

                    <label>
                      <span>Difficulty</span>
                      <select
                        value={formValues.difficulty}
                        onChange={(event) => handleFieldChange('difficulty', event.target.value)}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </label>

                    <label>
                      <span>Dietary tags</span>
                      <input
                        type="text"
                        value={formValues.dietary}
                        onChange={(event) => handleFieldChange('dietary', event.target.value)}
                        placeholder="dairy-free, pescatarian"
                      />
                    </label>

                    <label>
                      <span>Prep time (minutes)</span>
                      <input
                        type="number"
                        min="0"
                        value={formValues.prepTime}
                        onChange={(event) => handleFieldChange('prepTime', event.target.value)}
                      />
                    </label>

                    <label>
                      <span>Cook time (minutes)</span>
                      <input
                        type="number"
                        min="0"
                        value={formValues.cookTime}
                        onChange={(event) => handleFieldChange('cookTime', event.target.value)}
                      />
                    </label>

                    <label>
                      <span>Servings</span>
                      <input
                        type="number"
                        min="1"
                        value={formValues.servings}
                        onChange={(event) => handleFieldChange('servings', event.target.value)}
                      />
                    </label>

                    <label>
                      <span>Rating</span>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={formValues.rating}
                        onChange={(event) => handleFieldChange('rating', event.target.value)}
                      />
                    </label>
                  </div>
                </section>

                <section className="admin-form-section admin-image-section">
                  <div className="admin-section-heading">
                    <h3>Recipe image</h3>
                    <p>Paste a URL or upload directly to Supabase Storage.</p>
                  </div>

                  <div className="admin-image-layout">
                    <div className="admin-image-preview">
                      {formValues.image ? (
                        <img src={formValues.image} alt={formValues.nameEn || 'Recipe preview'} />
                      ) : (
                        <div className="admin-image-placeholder">
                          <ImageUp size={28} />
                          <span>No image selected yet</span>
                        </div>
                      )}
                    </div>

                    <div className="admin-image-controls">
                      <label>
                        <span>Image URL</span>
                        <input
                          type="text"
                          value={formValues.image}
                          onChange={(event) => handleFieldChange('image', event.target.value)}
                          placeholder="https://..."
                          required
                        />
                      </label>

                      <label className="admin-upload-field">
                        <span>Upload image to Supabase</span>
                        <input type="file" accept="image/*" onChange={handleUploadImage} />
                        <span className="admin-upload-button">
                          {saveState.uploading ? (
                            <>
                              <LoaderCircle size={18} className="spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <UploadCloud size={18} />
                              Choose image file
                            </>
                          )}
                        </span>
                      </label>
                    </div>
                  </div>
                </section>

                <section className="admin-form-section">
                  <div className="admin-section-heading">
                    <h3>Ingredients</h3>
                    <p>List ingredients in the order you want them shown.</p>
                  </div>

                  <div className="admin-stack-list">
                    {formValues.ingredients.map((ingredient, index) => (
                      <div key={`ingredient-${index + 1}`} className="admin-stack-card">
                        <div className="admin-inline-fields">
                          <label>
                            <span>Name</span>
                            <input
                              type="text"
                              value={ingredient.name}
                              onChange={(event) => handleIngredientChange(index, 'name', event.target.value)}
                              placeholder="Fish fillet"
                            />
                          </label>
                          <label>
                            <span>Amount</span>
                            <input
                              type="text"
                              value={ingredient.amount}
                              onChange={(event) => handleIngredientChange(index, 'amount', event.target.value)}
                              placeholder="500g"
                            />
                          </label>
                        </div>

                        <div className="admin-row-actions">
                          <label className="admin-checkbox-label">
                            <input
                              type="checkbox"
                              checked={ingredient.essential}
                              onChange={(event) => handleIngredientChange(index, 'essential', event.target.checked)}
                            />
                            <span>Essential ingredient</span>
                          </label>

                          <button type="button" className="admin-link-button" onClick={() => removeIngredient(index)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button type="button" className="btn-secondary admin-add-row-btn" onClick={addIngredient}>
                    <Plus size={18} />
                    Add Ingredient
                  </button>
                </section>

                <section className="admin-form-section">
                  <div className="admin-section-heading">
                    <h3>Cooking steps</h3>
                    <p>Add instructions, optional timers in seconds, and tips for cooking mode.</p>
                  </div>

                  <div className="admin-stack-list">
                    {formValues.steps.map((step, index) => (
                      <div key={`step-${index + 1}`} className="admin-stack-card">
                        <div className="admin-step-badge">{index + 1}</div>
                        <label>
                          <span>Instruction</span>
                          <textarea
                            rows="3"
                            value={step.instruction}
                            onChange={(event) => handleStepChange(index, 'instruction', event.target.value)}
                            placeholder="Steam for 30 minutes until cooked through."
                          />
                        </label>

                        <div className="admin-inline-fields">
                          <label>
                            <span>Timer (seconds)</span>
                            <input
                              type="number"
                              min="0"
                              value={step.timer}
                              onChange={(event) => handleStepChange(index, 'timer', event.target.value)}
                              placeholder="180"
                            />
                          </label>
                          <label>
                            <span>Tip</span>
                            <input
                              type="text"
                              value={step.tip}
                              onChange={(event) => handleStepChange(index, 'tip', event.target.value)}
                              placeholder="Use fresh coconut milk for a richer texture."
                            />
                          </label>
                        </div>

                        <div className="admin-row-actions admin-row-actions-end">
                          <button type="button" className="admin-link-button" onClick={() => removeStep(index)}>
                            Remove step
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button type="button" className="btn-secondary admin-add-row-btn" onClick={addStep}>
                    <Plus size={18} />
                    Add Step
                  </button>
                </section>
              </form>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
