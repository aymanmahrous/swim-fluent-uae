# Phone validation dependency decision

`libphonenumber-js/max` is used because the booking flow requires country-specific validity checks on both client and server, not only a length or formatting regular expression. The `max` metadata set provides the strict number-type and digit-pattern validation needed for public booking input while remaining a focused phone-number dependency.

The database does not attempt to duplicate the full international numbering-plan metadata. It enforces canonical E.164 structure and length, while the server route performs semantic country validation before the protected ingress RPC.
