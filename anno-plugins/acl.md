
Permissions Management
======================

Rules
-----

The ACL is a list of rules in the format used by
[sift-rule](https://www.npmjs.com/package/sift-rule).
The first matching rule "wins", i.e. decides whether an action is allowed.

Your local ACL file may be empty, but is required, to guard against the
case of an accidentially missing ACL, i.e. in case of a failing mount point.

Some [default rules](../../anno-plugins/acl.defaults.yaml)
are appended to your local ACL rules for your convenience.
If you prefer to not use them, just add a final deny rule to your local ACL,
just like the final default rule.



Roles
-----

Roles are used in [Rules](#rules) to define rights for groups of users.
They have no meaning without rules that use them!



Roles as used in the default ACL
--------------------------------

### admin

* All-powerful

### creator

* May create new annotations
* May edit their own annotations
* May comment on annotations

### moderator

* All from [creator](#creator)
* May edit other people's annotations

### doiMinter

* May assign DOI to an annotation


