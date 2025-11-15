from django import forms
from django.contrib.auth.forms import UserCreationForm
from game_site.models import CustomUser   # the model that holds user_type


class SignUpForm(UserCreationForm):
    """
    Extends the built‑in UserCreationForm with a role selector.
    The selector is rendered as radio buttons because we use
    `forms.RadioSelect` as the widget.
    """
    user_type = forms.ChoiceField(
        choices=CustomUser.USER_TYPE_CHOICES,
        widget=forms.RadioSelect,          # renders two radios: Gamer / Developer
        label="Choose your role",
    )

    class Meta:
        model = CustomUser
        # include the role field together with the usual ones
        fields = ("username", "password1", "password2", "user_type")