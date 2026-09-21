# E-postmaler

Lim inn i Supabase → **Authentication → Email Templates** (én mal per fane), og sett også emnet (Subject).

| Fane i Supabase | Fil | Emne (Subject) |
| --- | --- | --- |
| Confirm signup | `confirm-signup.html` | Bekreft e-posten din til Kollokvie@IFI |
| Change email address | `change-email.html` | Bekreft ny e-postadresse |
| Magic link | `magic-link.html` | Innloggingskoden din til Kollokvie@IFI |
| Reset password | `reset-password.html` | Kode for å tilbakestille passordet ditt |
| Invite user | `invite-user.html` | Du er invitert til Kollokvie@IFI |
| Reauthentication | `reauthentication.html` | Bekreftelseskode fra Kollokvie@IFI |

Appen bruker **Confirm signup**, **Change email address** og **Reset password** (alle med kode). De andre er klare hvis du senere slår på invitasjoner eller innlogging med kode.

Malene bruker `{{ .Token }}` (koden), `{{ .NewEmail }}` og `{{ .ConfirmationURL }}`; ikke endre disse. De er bygget med tabeller og inline-stiler så de fungerer i Outlook/Microsoft 365, og har mørk modus.
