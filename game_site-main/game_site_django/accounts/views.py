# accounts/views.py

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator  
from django.urls import reverse_lazy
from django.views.generic import CreateView
from django.contrib.auth import authenticate, login, logout   
from django.http import JsonResponse  

# Import the form we just created
from .forms import SignUpForm

@csrf_exempt
def api_logout(request):
    """
    POST /accounts/logout/
    Deletes the session cookie and returns a JSON message.
    """
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed. Use POST."}, status=405)

    logout(request)                          # removes the session cookie
    return JsonResponse({"detail": "Logged out"}, status=200)

@method_decorator(csrf_exempt, name="dispatch")
class SignUpView(CreateView):
    """
    Renders the signup template and creates a new CustomUser.
    After a successful sign‑up the user is redirected to the login page.
    """
    form_class = SignUpForm               # <-- use our custom form
    success_url = reverse_lazy("login")
    template_name = "registration/signup.html"
    
    
@csrf_exempt
def api_login(request):
    """
    POST /accounts/login/
    Body (application/x-www-form-urlencoded):
        username=<username>&password=<password>

    Returns JSON:
        200 → {"detail": "Logged in", "username": "<username>"}
        400 → {"detail": "<error message>"}
        405 → {"detail": "Method not allowed"}
    """
    if request.method != "POST":
        return JsonResponse(
            {"detail": "Method not allowed. Use POST."},
            status=405,
        )

    # -------------------------------------------------
    # 1️⃣ Pull the credentials from the request
    # -------------------------------------------------
    username = request.POST.get("username")
    password = request.POST.get("password")

    # -------------------------------------------------
    # 2️⃣ Validate that both fields are present
    # -------------------------------------------------
    if not username or not password:
        return JsonResponse(
            {"detail": "Both username and password are required."},
            status=400,
        )

    # -------------------------------------------------
    # 3️⃣ Authenticate against Django's auth backend
    # -------------------------------------------------
    user = authenticate(request, username=username, password=password)

    if user is None:
        return JsonResponse(
            {"detail": "Invalid credentials."},
            status=400,
        )

    # -------------------------------------------------
    # 4️⃣ Log the user in (creates the session cookie)
    # -------------------------------------------------
    login(request, user)

    # -------------------------------------------------
    # 5️⃣ Success response – include the username
    # -------------------------------------------------
    return JsonResponse(
        {"detail": "Logged in", "username": user.username},
        status=200,
    )