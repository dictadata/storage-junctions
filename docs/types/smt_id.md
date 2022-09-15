# smt_urn Codex Key Field

An smt_urn is comprised of the domain and name fields for a codex entry. The format of an smt_urn value is `domain:name`.

This is analogous to the URN syntax `urn:<namespace>:<name>` without the 'urn:' prefix and follows the same character syntax rules. See [RFC2141 URN Syntax](https://datatracker.ietf.org/doc/html/rfc2141)

**Examples:**

```code
   :foo_schema
   census.gov:tl_2020_us_state
   usgs.gov:us_national_fed_codes
   sos.iowa.gov:bl_2010_us_ia_county_precincts
```

## Allowed Characters

  `Domain`, namespace identifier, can contain ONLY letters, numbers, '-', '.' and '+' characters.

  `Name`, namespace specific identifier, can contain any printable character except the reserved characters noted below.

## Reserved Characters

   The following character set contains various characters that cannot appear in an smt_urn. They are reserved
   for other uses.  

   '%" | "/" | "?" | "#"

---
