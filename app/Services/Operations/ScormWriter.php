<?php

namespace App\Services\Operations;

final class ScormWriter
{
    /** @param list<array{title:string,file:string,links:array}> $chapters */
    public function manifest(array $chapters): string
    {
        $items = '';
        $resources = '';
        foreach ($chapters as $i => $chapter) {
            if ($chapter['links']) {
                TextAssetArchive::reject('External link materials require the native format.');
            }
            $title = htmlspecialchars($chapter['title'], ENT_XML1 | ENT_QUOTES, 'UTF-8');
            $file = $chapter['file'];
            $items .= "<item identifier=\"I$i\" identifierref=\"R$i\"><title>$title</title></item>";
            $resources .= "<resource identifier=\"R$i\" type=\"webcontent\" adlcp:scormtype=\"asset\" href=\"$file\"><file href=\"$file\"/></resource>";
        }

        return '<manifest identifier="course" xmlns="'.ScormReader::IMS.'" xmlns:adlcp="'.ScormReader::ADL.'">'
            .'<metadata><schema>ADL SCORM</schema><schemaversion>1.2</schemaversion></metadata>'
            .'<organizations default="ORG"><organization identifier="ORG"><title>Course chapters</title>'.$items
            .'</organization></organizations><resources>'.$resources.'</resources></manifest>';
    }
}
