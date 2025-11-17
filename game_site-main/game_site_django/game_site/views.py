# game_site/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.csrf import csrf_exempt          # <-- needed
from django.utils.decorators import method_decorator
from django.contrib.auth import authenticate, login 
from .models import (
    Game,
    Genre,
    Platform,
    Store,
    Size,
    Developer,
    Publisher,
    DLC,
    GameMode,
    License,
    SystemRequirement,
    Review,
    Multimedia,
    Status,
    SalesHistory,
    GameLog,
    Rating,
    OnlineStatus,
    Award,
    Language,
)
from django.http import JsonResponse
# If you prefer the ModelForm route, uncomment the next line:
# from .forms import GameForm
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.http import HttpResponseRedirect
from django.urls import reverse



@csrf_exempt                     # <-- disables CSRF for this view
def api_login(request):
    """
    Expected POST body (application/x-www-form-urlencoded):
        username=<username>&password=<password>
    Returns JSON:
        200 → {"detail": "Logged in"}
        400 → {"detail": "<error message>"}
        405 → {"detail": "Method not allowed"}
    """
    if request.method != "POST":
        # Wrong HTTP verb – tell the client what is allowed
        return JsonResponse(
            {"detail": "Method not allowed. Use POST."},
            status=405,
        )

    # -----------------------------------------------------------------
    # 1️⃣  Pull the credentials from the request
    # -----------------------------------------------------------------
    username = request.POST.get("username")
    password = request.POST.get("password")

    # -----------------------------------------------------------------
    # 2️⃣  Validate that both fields are present
    # -----------------------------------------------------------------
    if not username or not password:
        return JsonResponse(
            {"detail": "Both username and password are required."},
            status=400,
        )

    # -----------------------------------------------------------------
    # 3️⃣  Authenticate against Django's auth backend
    # -----------------------------------------------------------------
    user = authenticate(request, username=username, password=password)

    if user is None:
        # Wrong credentials – do NOT reveal which part is wrong
        return JsonResponse(
            {"detail": "Invalid credentials."},
            status=400,
        )

    # -----------------------------------------------------------------
    # 4️⃣  Log the user in (creates the session cookie)
    # -----------------------------------------------------------------
    login(request, user)

    # -----------------------------------------------------------------
    # 5️⃣  Success response
    # -----------------------------------------------------------------
    return JsonResponse({"detail": "Logged in"}, status=200)

@csrf_exempt
@login_required
@require_POST
def toggle_whitelist(request, game_id):
    """
    Add or remove ``game_id`` from the current user’s whitelist.
    The view redirects back to the page that issued the POST
    (normally the game list or home page).
    """
    game = get_object_or_404(Game, pk=game_id)

    # Toggle – if it’s already there we remove it, otherwise we add it
    if game in request.user.whitelisted_games.all():
        request.user.whitelisted_games.remove(game)
    else:
        request.user.whitelisted_games.add(game)

    # Preserve the original query‑string (search / filters) if present
    referer = request.META.get("HTTP_REFERER")
    if referer:
        return HttpResponseRedirect(referer)
    return redirect("home")   # fallback


def game_detail_json(request, game_id):
    game = get_object_or_404(Game, id=game_id)
    
    data = {
        "name": game.game_name,
        "genre": game.genre.Genre_Name if game.genre else "",
        "platform": game.platform.Platform_Name if game.platform else "",
        "store": game.store.Store_Name if game.store else "",
        "developer": str(game.developer) if game.developer else "",
        "publisher": str(game.publisher) if game.publisher else "",
        "dlc": str(game.dlc) if game.dlc else "None",
        "mode": game.game_mode.mode_name if game.game_mode else "",
        "license": game.license.license_name if game.license else "",
        "system_requirements": {
            "os": game.system_requirements.operating_system if game.system_requirements else "",
            "cpu": game.system_requirements.processor if game.system_requirements else "",
            "ram": game.system_requirements.ram if game.system_requirements else "",
            "gpu": game.system_requirements.gpu if game.system_requirements else "",
        },
        "rating": game.review.rating if game.review else "–",
        "players": game.online_status.active_players if game.online_status else "–",
        "award": game.award.award_name if game.award else "–",
        "language": game.language.language_name if game.language else "",
        "sales": game.sales_history.units_sold if game.sales_history else "",
    }
    return JsonResponse(data)

def games_view(request):
    """
    Handles:
    • GET – list games (optionally filtered by ?search=)
    • POST – create a new Game record
    """

    # -------------------------------------------------
    # 1️⃣  Process a POST (adding a new game)
    # -------------------------------------------------
    if request.method == "POST":
        # ----- Option A: use the ModelForm (simpler) -----
        # form = GameForm(request.POST)
        # if form.is_valid():
        #     form.save()
        #     return redirect("games")
        # -------------------------------------------------
        # ----- Option B: manual handling (explicit) -----
        # Grab the required fields
        game_name = request.POST.get("game_name")
        genre_pk  = request.POST.get("genre")
        platform_pk = request.POST.get("platform")
        store_pk    = request.POST.get("store")

        # Optional foreign‑key values (may be empty strings)
        size_pk                = request.POST.get("size")
        developer_pk           = request.POST.get("developer")
        publisher_pk           = request.POST.get("publisher")
        dlc_pk                 = request.POST.get("dlc")
        game_mode_pk           = request.POST.get("game_mode")
        license_pk             = request.POST.get("license")
        sys_req_pk             = request.POST.get("system_requirements")
        review_pk              = request.POST.get("review")
        multimedia_pk          = request.POST.get("multimedia")
        status_pk              = request.POST.get("status")
        sales_history_pk       = request.POST.get("sales_history")
        game_log_pk            = request.POST.get("game_log")
        rating_pk              = request.POST.get("rating")
        online_status_pk       = request.POST.get("online_status")
        award_pk               = request.POST.get("award")
        language_pk            = request.POST.get("language")

        # Build the kwargs dict – skip any optional field that is empty
        create_kwargs = {
            "game_name": game_name,
            "genre_id": genre_pk,
            "platform_id": platform_pk,
            "store_id": store_pk,
        }

        # Helper to add an optional FK only when a value was supplied
        def maybe_add(key, pk):
            if pk:                     # empty string evaluates False
                create_kwargs[key] = pk

        maybe_add("size_id", size_pk)
        maybe_add("developer_id", developer_pk)
        maybe_add("publisher_id", publisher_pk)
        maybe_add("dlc_id", dlc_pk)
        maybe_add("game_mode_id", game_mode_pk)
        maybe_add("license_id", license_pk)
        maybe_add("system_requirements_id", sys_req_pk)
        maybe_add("review_id", review_pk)
        maybe_add("multimedia_id", multimedia_pk)
        maybe_add("status_id", status_pk)
        maybe_add("sales_history_id", sales_history_pk)
        maybe_add("game_log_id", game_log_pk)
        maybe_add("rating_id", rating_pk)
        maybe_add("online_status_id", online_status_pk)
        maybe_add("award_id", award_pk)
        maybe_add("language_id", language_pk)

        # Finally create the Game instance
        Game.objects.create(**create_kwargs)

        # Redirect to avoid double‑POST on browser refresh
        return redirect("games")
        # -------------------------------------------------

    # -------------------------------------------------
    # 2️⃣  GET – list games (with optional search)
    # -------------------------------------------------
    # -------------------------------------------------
# 2️⃣  GET – list games (use the same logic as games_view_main)
# -------------------------------------------------
# Base queryset with the related objects needed for sorting
    games_qs = Game.objects.select_related(
        "genre", "platform", "store", "rating", "online_status"
    ).all()

    # ---- Query‑string parameters (search / filters / sort / whitelist) ----
    search_term      = request.GET.get("search", "").strip()
    genre_filter     = request.GET.get("genre", "")
    platform_filter  = request.GET.get("platform", "")
    store_filter     = request.GET.get("store", "")
    whitelisted      = request.GET.get("whitelisted")
    sort_by          = request.GET.get("sort", "")

    # ---- Searching ----
    if search_term:
        games_qs = games_qs.filter(game_name__icontains=search_term)

    # ---- Filtering ----
    if genre_filter:
        games_qs = games_qs.filter(genre_id=genre_filter)
    if platform_filter:
        games_qs = games_qs.filter(platform_id=platform_filter)
    if store_filter:
        games_qs = games_qs.filter(store_id=store_filter)

    if whitelisted == "yes":
        games_qs = games_qs.filter(whitelisted_by=request.user)
    elif whitelisted == "no":
        games_qs = games_qs.exclude(whitelisted_by=request.user)

    # ---- Sorting ----
    if sort_by == "name":
        games_qs = games_qs.order_by("game_name")
    elif sort_by == "rating":
        games_qs = games_qs.order_by("-review__rating")
    elif sort_by == "players":
        games_qs = games_qs.order_by("-online_status__active_players")

    # ---- Context (keep existing look‑ups + extra vars for the filter bar) ----
    context = {
        "games": games_qs,
        "genres": Genre.objects.all(),
        "platforms": Platform.objects.all(),
        "stores": Store.objects.all(),
        # look‑ups used by the “Add Game” form
        "sizes": Size.objects.all(),
        "developers": Developer.objects.all(),
        "publishers": Publisher.objects.all(),
        "dlcs": DLC.objects.all(),
        "gamemodes": GameMode.objects.all(),
        "licenses": License.objects.all(),
        "sysreqs": SystemRequirement.objects.all(),
        "reviews": Review.objects.all(),
        "multimedias": Multimedia.objects.all(),
        "statuses": Status.objects.all(),
        "sales_histories": SalesHistory.objects.all(),
        "gamelogs": GameLog.objects.all(),
        "ratings": Rating.objects.all(),
        "online_statuses": OnlineStatus.objects.all(),
        "awards": Award.objects.all(),
        "languages": Language.objects.all(),
        # extra variables needed by the filter/search bar
        "search": search_term,
        "selected_genre": genre_filter,
        "selected_platform": platform_filter,
        "selected_store": store_filter,
        "sort_by": sort_by,
        "whitelisted": whitelisted,
    }
    return render(request, "games.html", context)
    
def games_view_main(request):
    """
    Home page – lists all games with optional:
      • search by name
      • filter by genre / platform / store
      • sort by name, rating, or player count
    """
    # Start with all games
    games_qs = Game.objects.select_related(
        "genre", "platform", "store", "rating", "online_status"
    ).all()

    # Get query parameters
    search_term = request.GET.get("search", "").strip()
    genre_filter = request.GET.get("genre", "")
    platform_filter = request.GET.get("platform", "")
    store_filter = request.GET.get("store", "")
    whitelisted = request.GET.get("whitelisted")
    sort_by = request.GET.get("sort", "")

    # --- Searching ---
    if search_term:
        games_qs = games_qs.filter(game_name__icontains=search_term)

    # --- Filtering ---
    if genre_filter:
        games_qs = games_qs.filter(genre_id=genre_filter)
    if platform_filter:
        games_qs = games_qs.filter(platform_id=platform_filter)
    if store_filter:
        games_qs = games_qs.filter(store_id=store_filter)
    if whitelisted == "yes":
        # Show only games that the current user has whitelisted
        games_qs = games_qs.filter(whitelisted_by=request.user)
    elif whitelisted == "no":
        # Exclude the games the user has whitelisted
        games_qs = games_qs.exclude(whitelisted_by=request.user)

    # --- Sorting ---
    if sort_by == "name":
        games_qs = games_qs.order_by("game_name")
    elif sort_by == "rating":
        # Sort by the numeric Review rating if exists, else 0
        games_qs = games_qs.order_by("-review__rating")
    elif sort_by == "players":
        games_qs = games_qs.order_by("-online_status__active_players")

    # --- Context for template ---
    context = {
        "games": games_qs,
        "genres": Genre.objects.all(),
        "platforms": Platform.objects.all(),
        "stores": Store.objects.all(),
        "search": search_term,
        "selected_genre": genre_filter,
        "selected_platform": platform_filter,
        "selected_store": store_filter,
        "sort_by": sort_by,
        "whitelisted": whitelisted,
    }

    return render(request, "home.html", context)

    
def delete_game(request, id):
    """
    Delete the Game instance identified by ``id`` and then show a
    tiny confirmation page that reads:

        “<Game name> has been deleted.”

    The page contains a single **OK** button that sends the user back to
    the game list.
    """
    # 1️⃣  Fetch the object – 404 if it does not exist
    game = get_object_or_404(Game, id=id)

    # 2️⃣  Remember the name *before* we delete it (we need it for the message)
    game_name = str(game)          # __str__ returns the title (game_name)
    # If you prefer the raw field:
    # game_name = game.game_name

    # 3️⃣  Perform the deletion
    game.delete()

    # 4️⃣  Render the confirmation template
    return render(request, "delete_game.html", {"game_name": game_name})
    

def update_game(request, id):
    """
    Render the same form you use for “Add Game”, but pre‑filled with the
    existing Game instance. Handles both GET (show form) and POST
    (apply changes).
    """
    game = get_object_or_404(Game, id=id)

    # -------------------------------------------------
    # 1️⃣  POST – user submitted the edited form
    # -------------------------------------------------
    if request.method == "POST":
        # ----- Required fields -----
        game_name   = request.POST.get("game_name")
        genre_pk    = request.POST.get("genre")
        platform_pk = request.POST.get("platform")
        store_pk    = request.POST.get("store")

        # ----- Optional fields (may be empty) -----
        size_pk                = request.POST.get("size")
        developer_pk           = request.POST.get("developer")
        publisher_pk           = request.POST.get("publisher")
        dlc_pk                 = request.POST.get("dlc")
        game_mode_pk           = request.POST.get("game_mode")
        license_pk             = request.POST.get("license")
        sys_req_pk             = request.POST.get("system_requirements")
        review_pk              = request.POST.get("review")
        multimedia_pk          = request.POST.get("multimedia")
        status_pk              = request.POST.get("status")
        sales_history_pk       = request.POST.get("sales_history")
        game_log_pk            = request.POST.get("game_log")
        rating_pk              = request.POST.get("rating")
        online_status_pk       = request.POST.get("online_status")
        award_pk               = request.POST.get("award")
        language_pk            = request.POST.get("language")

        # Build a dict of fields to update – required ones are always set
        update_kwargs = {
            "game_name": game_name,
            "genre_id": genre_pk,
            "platform_id": platform_pk,
            "store_id": store_pk,
        }

        # Helper – only add optional FK if a value was supplied
        def maybe_add(key, pk):
            if pk:                     # empty string → False
                update_kwargs[key] = pk

        maybe_add("size_id",                size_pk)
        maybe_add("developer_id",           developer_pk)
        maybe_add("publisher_id",           publisher_pk)
        maybe_add("dlc_id",                 dlc_pk)
        maybe_add("game_mode_id",           game_mode_pk)
        maybe_add("license_id",             license_pk)
        maybe_add("system_requirements_id", sys_req_pk)
        maybe_add("review_id",              review_pk)
        maybe_add("multimedia_id",          multimedia_pk)
        maybe_add("status_id",              status_pk)
        maybe_add("sales_history_id",       sales_history_pk)
        maybe_add("game_log_id",            game_log_pk)
        maybe_add("rating_id",              rating_pk)
        maybe_add("online_status_id",       online_status_pk)
        maybe_add("award_id",               award_pk)
        maybe_add("language_id",            language_pk)

        # Apply the updates to the existing instance
        for attr, val in update_kwargs.items():
            setattr(game, attr, val)

        game.save()
        return redirect("games")   # go back to the list view

    # -------------------------------------------------
    # 2️⃣  GET – render the form with *all* lookup tables
    # -------------------------------------------------
    context = {
        "game": game,                     # the instance we are editing
        "genres": Genre.objects.all(),
        "platforms": Platform.objects.all(),
        "stores": Store.objects.all(),
        "sizes": Size.objects.all(),
        "developers": Developer.objects.all(),
        "publishers": Publisher.objects.all(),
        "dlcs": DLC.objects.all(),
        "gamemodes": GameMode.objects.all(),
        "licenses": License.objects.all(),
        "sysreqs": SystemRequirement.objects.all(),
        "reviews": Review.objects.all(),
        "multimedias": Multimedia.objects.all(),
        "statuses": Status.objects.all(),
        "sales_histories": SalesHistory.objects.all(),
        "gamelogs": GameLog.objects.all(),
        "ratings": Rating.objects.all(),
        "online_statuses": OnlineStatus.objects.all(),
        "awards": Award.objects.all(),
        "languages": Language.objects.all(),
    }
    return render(request, "update_game.html", context)