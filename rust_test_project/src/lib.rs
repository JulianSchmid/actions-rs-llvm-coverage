
pub fn some_func() -> u64 {
    1
}

pub fn some_result(some: u64) -> Result<u64,bool> {
    if some > 10 {
        Err(some % 2 == 0)
    } else {
        Ok(some)
    }
}

pub fn some_result_return_using_function(some: u64) -> Result<bool,bool> {
    let re = some_result(some)?;
    Ok(re > 5)
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }

    #[test]
    fn some_result() {
        // check only the non error case (should result in some missing coverage)
        assert_eq!(false, crate::some_result_return_using_function(4).unwrap());
    }
}
