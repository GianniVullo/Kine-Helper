<script>
	import {DefaultFieldWrapper} from "../index";
    export let name = 'password';
</script>

<!--! MEGA ATTENTION /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/ LE PATTERN A CONSERVER -->

<DefaultFieldWrapper>
    <p>{name == 'password' ? "Mot de passe" : 'Confirmation du mot de passe'}</p>
    <div class="input-group input-group-divider grid-cols-[auto_1fr_auto] group-[.has-error]/field:border-error-500">
        <div class="input-group-shim">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-6 w-6 group-[.success]/field:stroke-emerald-600 group-[.has-error]/field:stroke-error-500">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
        </div>
        <input
            id={name}
            required
            pattern={name == 'password' ? /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/ : undefined}
            data-pristine-pattern-message={name == 'password' ? "Votre mot de passe doit contenir : <br> - au moins 8 caractères <br> - au moins un caractère spécial (!@#$%^&*) <br> - au moins une lettre majuscule <br> - au moins une lettre minuscule <br> - au moins un chiffre" : undefined}
            data-pristine-required-message="Ce champ est requis"
            {name}
            type="password"
            class="input group-[.has-error]/field:border-error-500" />
    </div>
</DefaultFieldWrapper>