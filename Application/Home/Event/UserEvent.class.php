<?php

namespace Home\Event;

/**
 *
 */
class UserEvent
{
    public function login()
    {
        # code...
        echo 'login event';
    }
    public function logout()
    {
        # code...
        echo 'logout event';
    }
}
