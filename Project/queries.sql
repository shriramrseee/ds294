update yagofacts
set id = replace(id, '<', ''),
    subject = replace(subject, '<', ''),
    predicate = replace(predicate, '<', ''),
    "object" = replace("object", '<', '')
    